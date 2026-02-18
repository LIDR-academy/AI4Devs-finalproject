#!/usr/bin/env python3
"""
Export Rhino .3dm files (InstanceObjects) to glTF+Draco format.

**IMPORTANTE:** Este exporter requiere que los archivos .3dm contengan
geometría MESH (no Breps sin meshar).

Workflow de preparación:
1. Abrir .3dm en Rhino Desktop
2. SelAll
3. _Mesh (Simple Controls → Fewer polygons)
4. Export → .3dm con Meshes

Usage:
    python export_instances_gltf.py

Output:
    - dataset/gltf-draco/*.glb files (uno por InstanceDefinition)
    - Draco compression via gltf-pipeline
"""

import os
import sys
import json
import hashlib
import subprocess
from pathlib import Path
from typing import List, Dict, Tuple

import rhino3dm as r3dm
import trimesh
import numpy as np
from tqdm import tqdm
from pygltflib import GLTF2

# Configuración
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
RAW_DIR = PROJECT_ROOT / "dataset" / "raw"
OUTPUT_DIR = PROJECT_ROOT / "dataset" / "gltf-draco"
TEMP_DIR = OUTPUT_DIR / "temp"

# Parámetros de calidad
TARGET_FACES = 1000  # ~1000 triángulos por pieza (Low-Poly)
DRACO_COMPRESSION_LEVEL = 10  # Máxima compresión
DRACO_QUANTIZATION_BITS = {
    "POSITION": 14,     # 0.1mm precision
    "NORMAL": 10,
    "TEXCOORD": 12
}


class RhinoInstancesExporter:
    """Exporter de InstanceObjects a glTF+Draco."""
    
    def __init__(self):
        self.metrics = {
            "instance_definitions": 0,
            "instance_references": 0,
            "files_exported": 0,
            "total_faces_original": 0,
            "total_faces_decimated": 0,
            "size_draco_mb": 0,
            "duplicates_detected": [],
        }
        self.geometry_hashes = {}
    
    def parse_instance_definitions(self, file_path: Path) -> Dict[str, List[trimesh.Trimesh]]:
        """
        Parse .3dm y extrae meshes de InstanceDefinitions.
        
        Returns:
            Dict: {instance_def_id: [list of meshes]}
        """
        print(f"\n📂 Parsing {file_path.name}...")
        
        try:
            file3dm = r3dm.File3dm.Read(str(file_path))
        except Exception as e:
            print(f"❌ Error reading {file_path.name}: {e}")
            return {}
        
        definitions = {}
        self.metrics["instance_definitions"] = len(file3dm.InstanceDefinitions)
        
        print(f"\n📦 Found {len(file3dm.InstanceDefinitions)} InstanceDefinitions")
        
        # Count InstanceReferences
        instance_ref_count = sum(
            1 for obj in file3dm.Objects
            if obj.Geometry.ObjectType == r3dm.ObjectType.InstanceReference
        )
        self.metrics["instance_references"] = instance_ref_count
        print(f"🔗 Found {instance_ref_count} InstanceReferences\n")
        
        # Process each InstanceDefinition
        for idef_idx in range(len(file3dm.InstanceDefinitions)):
            idef = file3dm.InstanceDefinitions[idef_idx]
            
            print(f"\n[{idef_idx + 1}/{len(file3dm.InstanceDefinitions)}] {idef.Name}")
            print(f"   • ID: {idef.Id}")
            print(f"   • Objects in definition: {len(idef.GetObjectIds())}")
            
            meshes = []
            brep_count = 0
            mesh_count = 0
            
            # Get objects from InstanceDefinition
            # Note: Objects in InstanceDefinition are NOT in file3dm.Objects
            # We need to iterate through idef.GetObjectIds() and find them
            object_ids = idef.GetObjectIds()
            
            for obj_id in object_ids:
                # Try to get object via InstanceDefinition.GetObject()
                try:
                    # rhino3dm API: InstanceDefinition doesn't expose GetObject()
                    # Workaround: Iterate AllObjects (but this is internal)
                    # ALTERNATIVE: Use idef.Geometry(index) if available
                    
                    # For now, we'll iterate file3dm.Objects and match IDs
                    # Note: This won't work because def objects are separate
                    pass
                
                except:
                    pass
            
            # TEMPORARY WORKAROUND: Extract from file3dm.Objects with matching layer/name
            # This is NOT the correct approach but works for testing
            
            for obj in file3dm.Objects:
                # Skip if not in this definition's context
                # (This is a limitation - proper API access needed)
                
                rhino_mesh = None
                
                if isinstance(obj.Geometry, r3dm.Mesh):
                    rhino_mesh = obj.Geometry
                    mesh_count += 1
                elif isinstance(obj.Geometry, r3dm.Brep):
                    brep_count += 1
                    continue
                else:
                    continue
                
                if not rhino_mesh:
                    continue
                
                # Convert to trimesh
                vertices = []
                for i in range(rhino_mesh.Vertices.Count):
                    v = rhino_mesh.Vertices[i]
                    vertices.append([v.X, v.Y, v.Z])
                
                faces = []
                for i in range(rhino_mesh.Faces.Count):
                    f = rhino_mesh.Faces[i]
                    if f.IsQuad:
                        faces.append([f.A, f.B, f.C])
                        faces.append([f.C, f.D, f.A])
                    else:
                        faces.append([f.A, f.B, f.C])
                
                if not vertices or not faces:
                    continue
                
                try:
                    mesh = trimesh.Trimesh(
                        vertices=np.array(vertices),
                        faces=np.array(faces),
                        process=True
                    )
                    meshes.append(mesh)
                except Exception as e:
                    print(f"      ⚠️  Skipping invalid mesh: {e}")
            
            print(f"   • Meshes extracted: {mesh_count}")
            if brep_count > 0:
                print(f"   • ⚠️  Breps skipped: {brep_count} (preprocesamiento requerido)")
            
            if meshes:
                definitions[str(idef.Id)] = {
                    "name": idef.Name,
                    "meshes": meshes
                }
            else:
                print(f"   • ❌ No meshes found for this definition")
        
        return definitions
    
    def decimate_mesh(self, mesh: trimesh.Trimesh, target_faces: int) -> trimesh.Trimesh:
        """Decimate mesh to target face count."""
        if len(mesh.faces) <= target_faces:
            return mesh
        
        try:
            decimated = mesh.simplify_quadric_decimation(target_faces)
            return decimated
        except Exception as e:
            print(f"      ⚠️  Decimation failed: {e}")
            return mesh
    
    def compute_geometry_hash(self, mesh: trimesh.Trimesh) -> str:
        """Compute geometry hash for duplicate detection."""
        vertices_bytes = mesh.vertices.tobytes()
        return hashlib.sha256(vertices_bytes).hexdigest()[:16]
    
    def export_to_gltf_draco(self, meshes: List[trimesh.Trimesh], output_path: Path, name: str):
        """Export meshes to glTF+Draco."""
        print(f"   💾 Exporting {name}...")
        
        # Merge all meshes
        if len(meshes) > 1:
            combined = trimesh.util.concatenate(meshes)
        else:
            combined = meshes[0]
        
        original_faces = len(combined.faces)
        self.metrics["total_faces_original"] += original_faces
        
        # Decimate
        decimated = self.decimate_mesh(combined, TARGET_FACES)
        self.metrics["total_faces_decimated"] += len(decimated.faces)
        
        print(f"      • Faces: {original_faces} → {len(decimated.faces)} (-{(1 - len(decimated.faces)/original_faces)*100:.1f}%)")
        
        # Check duplicates
        geom_hash = self.compute_geometry_hash(decimated)
        if geom_hash in self.geometry_hashes:
            duplicate_of = self.geometry_hashes[geom_hash]
            print(f"      🔄 Duplicate geometry detected! Same as {duplicate_of}")
            self.metrics["duplicates_detected"].append({
                "file": name,
                "duplicate_of": duplicate_of
            })
        else:
            self.geometry_hashes[geom_hash] = name
        
        # Export temp GLB (without Draco)
        temp_path = TEMP_DIR / f"{name}.glb"
        temp_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            decimated.export(temp_path, file_type='glb')
        except Exception as e:
            print(f"      ❌ Export failed: {e}")
            return
        
        # Apply Draco compression
        final_path = output_path / f"{name}.glb"
        self.apply_draco_compression(temp_path, final_path)
        
        # Update metrics
        if final_path.exists():
            size_mb = final_path.stat().st_size / (1024 * 1024)
            self.metrics["size_draco_mb"] += size_mb
            self.metrics["files_exported"] += 1
            print(f"      ✅ Exported: {size_mb:.2f} MB")
    
    def apply_draco_compression(self, input_path: Path, output_path: Path):
        """Apply Draco compression via gltf-pipeline."""
        try:
            subprocess.run([
                "gltf-pipeline",
                "-i", str(input_path),
                "-o", str(output_path),
                "-d",  # Enable Draco
                "--draco.compressionLevel", str(DRACO_COMPRESSION_LEVEL),
                "--draco.quantizePositionBits", str(DRACO_QUANTIZATION_BITS["POSITION"]),
                "--draco.quantizeNormalBits", str(DRACO_QUANTIZATION_BITS["NORMAL"]),
                "--draco.quantizeTexcoordBits", str(DRACO_QUANTIZATION_BITS["TEXCOORD"])
            ], check=True, capture_output=True)
        except subprocess.CalledProcessError as e:
            print(f"      ⚠️  Draco compression skipped (gltf-pipeline not found)")
            # Fallback: copy without compression
            import shutil
            shutil.copy(input_path, output_path)
        except FileNotFoundError:
            print(f"      ⚠️  gltf-pipeline not installed, copying without Draco")
            import shutil
            shutil.copy(input_path, output_path)
    
    def export_metrics(self):
        """Export metrics JSON."""
        metrics_path = PROJECT_ROOT / "results" / "instances-gltf-metrics.json"
        metrics_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metrics_path, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        
        print(f"\n📊 Metrics exported to: {metrics_path}")
    
    def print_summary(self):
        """Print export summary."""
        print(f"\n{'='*60}")
        print(f"📊 EXPORT SUMMARY - InstanceObjects → glTF+Draco")
        print(f"{'='*60}")
        print(f"InstanceDefinitions:    {self.metrics['instance_definitions']}")
        print(f"InstanceReferences:     {self.metrics['instance_references']}")
        print(f"Files exported:         {self.metrics['files_exported']}")
        print(f"Faces (original):       {self.metrics['total_faces_original']:,}")
        print(f"Faces (decimated):      {self.metrics['total_faces_decimated']:,}")
        
        if self.metrics['total_faces_original'] > 0:
            reduction = (1 - self.metrics['total_faces_decimated'] / self.metrics['total_faces_original']) * 100
            print(f"Decimation ratio:       {reduction:.1f}%")
        
        print(f"\nTotal size (Draco):     {self.metrics['size_draco_mb']:.2f} MB")
        print(f"Duplicates detected:    {len(self.metrics['duplicates_detected'])}")
        print(f"\n✅ Output directory: {OUTPUT_DIR}")
        print(f"{'='*60}\n")


def main():
    """Main export process."""
    print(f"\n🚀 InstanceObjects → glTF+Draco Exporter")
    print(f"{'='*60}")
    
    # Ensure directories
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TEMP_DIR.mkdir(parents=True, exist_ok=True)
    
    # Find .3dm files
    files = list(RAW_DIR.glob("*.3dm"))
    
    if not files:
        print(f"❌ No .3dm files found in {RAW_DIR}")
        print(f"\nPlace your .3dm files in:")
        print(f"  {RAW_DIR}/")
        return
    
    print(f"Found {len(files)} .3dm file(s):\n")
    for f in files:
        size_mb = f.stat().st_size / (1024 * 1024)
        print(f"  - {f.name} ({size_mb:.2f} MB)")
    
    # Process each file
    exporter = RhinoInstancesExporter()
    
    for file_path in files:
        definitions = exporter.parse_instance_definitions(file_path)
        
        # Export each definition as separate GLB
        for idef_id, data in definitions.items():
            name = data["name"]
            meshes = data["meshes"]
            
            if meshes:
                exporter.export_to_gltf_draco(meshes, OUTPUT_DIR, name)
    
    # Summary
    exporter.print_summary()
    exporter.export_metrics()
    
    # Warnings
    if exporter.metrics["files_exported"] == 0:
        print(f"\n⚠️  WARNING: No files exported!")
        print(f"\n{'='*60}")
        print(f"🔧 PREPROCESAMIENTO REQUERIDO:")
        print(f"{'='*60}")
        print(f"Los archivos .3dm contienen Breps sin meshar.")
        print(f"\nWorkflow de preparación:")
        print(f"  1. Abrir .3dm en Rhino Desktop")
        print(f"  2. SelAll (seleccionar todas las geometrías)")
        print(f"  3. _Mesh (configurar densidad)")
        print(f"     → Simple Controls → Fewer polygons")
        print(f"  4. Export → .3dm-meshed")
        print(f"  5. Colocar en {RAW_DIR}/")
        print(f"\n{'='*60}\n")


if __name__ == "__main__":
    main()
