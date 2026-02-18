#!/usr/bin/env python3
"""
Export Rhino .3dm files to glTF+Draco format for POC comparison.

Usage:
    python export_gltf_draco.py

Output:
    - dataset/gltf-draco/*.glb files
    - Draco compression via gltf-pipeline (Node.js)
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


class RhinoToGltfExporter:
    """Exporter de .3dm a glTF+Draco con métricas de performance."""
    
    def __init__(self):
        self.metrics = {
            "files_processed": 0,
            "total_faces_original": 0,
            "total_faces_decimated": 0,
            "size_original_mb": 0,
            "size_gltf_mb": 0,
            "size_draco_mb": 0,
            "duplicates_detected": [],
        }
        self.geometry_hashes = {}  # Para detectar duplicados
    
    def parse_rhino_file(self, file_path: Path) -> List[trimesh.Trimesh]:
        """Parse .3dm y extrae meshes como trimesh objects."""
        print(f"\n📂 Parsing {file_path.name}...")
        
        try:
            file3dm = r3dm.File3dm.Read(str(file_path))
        except Exception as e:
            print(f"❌ Error reading {file_path.name}: {e}")
            return []
        
        meshes = []
        brep_count = 0
        mesh_count = 0
        
        for obj in file3dm.Objects:
            # Intentar obtener mesh
            rhino_mesh = None
            
            if isinstance(obj.Geometry, r3dm.Mesh):
                rhino_mesh = obj.Geometry
                mesh_count += 1
            elif isinstance(obj.Geometry, r3dm.Brep):
                # rhino3dm no expone CreateMesh() - omitir Breps en POC
                brep_count += 1
                continue
            
            if not rhino_mesh:
                continue
            
            # Convertir a trimesh
            vertices = []
            for i in range(rhino_mesh.Vertices.Count):
                v = rhino_mesh.Vertices[i]
                vertices.append([v.X, v.Y, v.Z])
            
            faces = []
            for i in range(rhino_mesh.Faces.Count):
                f = rhino_mesh.Faces[i]
                if f.IsQuad:
                    # Quad → 2 triángulos
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
                    process=True  # Clean + merge duplicates
                )
                meshes.append(mesh)
                print(f"  ✓ Mesh extracted: {len(vertices)} verts, {len(faces)} faces")
            except Exception as e:
                print(f"  ⚠️  Skipping invalid mesh: {e}")
        
        print(f"\n📊 Parsing summary:")
        print(f"  • Meshes processed: {mesh_count}")
        if brep_count > 0:
            print(f"  • Breps skipped: {brep_count} (rhino3dm API limitation)")
        
        return meshes
    
    def decimate_mesh(self, mesh: trimesh.Trimesh, target_faces: int) -> trimesh.Trimesh:
        """Decimate mesh to target face count usando quadric decimation."""
        if len(mesh.faces) <= target_faces:
            print(f"  → Already low-poly ({len(mesh.faces)} faces), skipping decimation")
            return mesh
        
        print(f"  🔻 Decimating {len(mesh.faces)} → {target_faces} faces...")
        
        try:
            decimated = mesh.simplify_quadric_decimation(target_faces)
            reduction_pct = (1 - len(decimated.faces) / len(mesh.faces)) * 100
            print(f"  ✓ Decimated: {len(decimated.faces)} faces (-{reduction_pct:.1f}%)")
            return decimated
        except Exception as e:
            print(f"  ⚠️  Decimation failed: {e}, using original")
            return mesh
    
    def compute_geometry_hash(self, mesh: trimesh.Trimesh) -> str:
        """Compute hash de geometría para detectar duplicados."""
        # Hash basado en vértices (position only, ignoring transform)
        vertices_bytes = mesh.vertices.tobytes()
        return hashlib.sha256(vertices_bytes).hexdigest()[:16]
    
    def export_to_gltf(self, mesh: trimesh.Trimesh, output_path: Path, file_name: str):
        """Export mesh a glTF (sin Draco aún, será aplicado después)."""
        print(f"  💾 Exporting to glTF: {output_path.name}")
        
        # Añadir metadata como extras
        mesh.metadata = {
            "name": file_name,
            "face_count": len(mesh.faces),
            "vertex_count": len(mesh.vertices)
        }
        
        # Export usando trimesh (genera glTF válido)
        mesh.export(str(output_path), file_type='glb')
        
        file_size_mb = output_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ Exported: {file_size_mb:.2f} MB")
        return file_size_mb
    
    def apply_draco_compression(self, input_path: Path, output_path: Path):
        """Apply Draco compression via gltf-pipeline (Node.js CLI)."""
        print(f"  🗜️  Applying Draco compression...")
        
        # Check if gltf-pipeline is installed
        try:
            subprocess.run(
                ["gltf-pipeline", "--help"],
                capture_output=True,
                check=True
            )
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("  ⚠️  gltf-pipeline not found. Install with: npm install -g gltf-pipeline")
            print("  ⚠️  Copying without Draco compression...")
            import shutil
            shutil.copy(input_path, output_path)
            return
        
        # Build command
        cmd = [
            "gltf-pipeline",
            "-i", str(input_path),
            "-o", str(output_path),
            "-d",  # Enable Draco compression
            "--draco.compressionLevel", str(DRACO_COMPRESSION_LEVEL),
            "--draco.quantizePositionBits", str(DRACO_QUANTIZATION_BITS["POSITION"]),
            "--draco.quantizeNormalBits", str(DRACO_QUANTIZATION_BITS["NORMAL"]),
            "--draco.quantizeTexcoordBits", str(DRACO_QUANTIZATION_BITS["TEXCOORD"]),
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            file_size_mb = output_path.stat().st_size / (1024 * 1024)
            print(f"  ✓ Draco applied: {file_size_mb:.2f} MB")
            return file_size_mb
        except subprocess.CalledProcessError as e:
            print(f"  ❌ Draco compression failed: {e.stderr}")
            # Fallback: copy without compression
            import shutil
            shutil.copy(input_path, output_path)
            return input_path.stat().st_size / (1024 * 1024)
    
    def process_file(self, file_path: Path, instance_index: int = None):
        """Process single .3dm file to glTF+Draco."""
        file_name = file_path.stem
        
        # Si es instancia, modificar nombre
        if instance_index is not None:
            file_name = f"{file_name}-instance-{instance_index}"
        
        print(f"\n{'='*60}")
        print(f"Processing: {file_name}")
        print(f"{'='*60}")
        
        # Parse Rhino
        meshes = self.parse_rhino_file(file_path)
        if not meshes:
            print("❌ No meshes found, skipping")
            return
        
        # Merge all meshes into one
        if len(meshes) > 1:
            print(f"  🔗 Merging {len(meshes)} meshes...")
            combined_mesh = trimesh.util.concatenate(meshes)
        else:
            combined_mesh = meshes[0]
        
        original_faces = len(combined_mesh.faces)
        self.metrics["total_faces_original"] += original_faces
        
        # Decimate
        decimated_mesh = self.decimate_mesh(combined_mesh, TARGET_FACES)
        self.metrics["total_faces_decimated"] += len(decimated_mesh.faces)
        
        # Check for duplicates
        geom_hash = self.compute_geometry_hash(decimated_mesh)
        if geom_hash in self.geometry_hashes:
            duplicate_of = self.geometry_hashes[geom_hash]
            print(f"  🔄 Duplicate detected! Same geometry as {duplicate_of}")
            self.metrics["duplicates_detected"].append({
                "file": file_name,
                "duplicate_of": duplicate_of
            })
        else:
            self.geometry_hashes[geom_hash] = file_name
        
        # Export to glTF (temp, sin Draco)
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        temp_path = TEMP_DIR / f"{file_name}-temp.glb"
        gltf_size = self.export_to_gltf(decimated_mesh, temp_path, file_name)
        self.metrics["size_gltf_mb"] += gltf_size
        
        # Apply Draco compression
        final_path = OUTPUT_DIR / f"{file_name}.glb"
        draco_size = self.apply_draco_compression(temp_path, final_path)
        self.metrics["size_draco_mb"] += draco_size
        
        # Cleanup temp
        temp_path.unlink()
        
        self.metrics["files_processed"] += 1
        
        print(f"✅ Completed: {file_name}.glb ({draco_size:.2f} MB)")
    
    def export_metrics(self):
        """Export metrics JSON for analysis."""
        metrics_path = PROJECT_ROOT / "results" / "gltf-metrics.json"
        metrics_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metrics_path, "w") as f:
            json.dump(self.metrics, f, indent=2)
        
        print(f"\n📊 Metrics exported to: {metrics_path}")
    
    def print_summary(self):
        """Print export summary."""
        print(f"\n{'='*60}")
        print("📊 EXPORT SUMMARY - glTF+Draco")
        print(f"{'='*60}")
        print(f"Files processed:        {self.metrics['files_processed']}")
        print(f"Faces (original):       {self.metrics['total_faces_original']:,}")
        print(f"Faces (decimated):      {self.metrics['total_faces_decimated']:,}")
        print(f"Decimation ratio:       {(1 - self.metrics['total_faces_decimated'] / max(self.metrics['total_faces_original'], 1)) * 100:.1f}%")
        print(f"\nSize glTF (no Draco):   {self.metrics['size_gltf_mb']:.2f} MB")
        print(f"Size glTF+Draco:        {self.metrics['size_draco_mb']:.2f} MB")
        print(f"Draco compression:      {(1 - self.metrics['size_draco_mb'] / max(self.metrics['size_gltf_mb'], 0.01)) * 100:.1f}%")
        print(f"\nDuplicates detected:    {len(self.metrics['duplicates_detected'])}")
        
        if self.metrics['duplicates_detected']:
            print("\n🔄 Duplicate Geometries:")
            for dup in self.metrics['duplicates_detected']:
                print(f"  - {dup['file']} → {dup['duplicate_of']}")
        
        print(f"\n✅ Output directory: {OUTPUT_DIR}")
        print(f"{'='*60}\n")


def main():
    """Main entry point."""
    print("🚀 glTF+Draco Exporter for POC")
    print("=" * 60)
    
    # Check raw directory exists
    if not RAW_DIR.exists():
        print(f"❌ Raw directory not found: {RAW_DIR}")
        print("   Please create it and add .3dm test files")
        sys.exit(1)
    
    # Get .3dm files
    rhino_files = list(RAW_DIR.glob("*.3dm"))
    if not rhino_files:
        print(f"❌ No .3dm files found in {RAW_DIR}")
        sys.exit(1)
    
    print(f"Found {len(rhino_files)} .3dm files:\n")
    for f in rhino_files:
        size_mb = f.stat().st_size / (1024 * 1024)
        print(f"  - {f.name} ({size_mb:.2f} MB)")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialize exporter
    exporter = RhinoToGltfExporter()
    
    # Process files
    for file_path in rhino_files:
        # Check if file should be instanced (capitel-001 → create 5 instances)
        if "capitel-001" in file_path.stem.lower():
            print(f"\n🔁 Creating 5 instances of {file_path.name}...")
            for i in range(1, 6):
                exporter.process_file(file_path, instance_index=i)
        else:
            exporter.process_file(file_path)
    
    # Print summary
    exporter.print_summary()
    exporter.export_metrics()
    
    print("✅ glTF+Draco export completed!")
    print("   Next: python export_thatopen_frag.py")


if __name__ == "__main__":
    main()
