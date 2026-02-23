#!/usr/bin/env python3
"""
Export Rhino .3dm files to ThatOpen Fragments format (via IFC bridge).

NOTE: ThatOpen Fragments typically work with IFC files. Since we have .3dm,
we'll create a pseudo-IFC or use direct fragment generation via Node.js.

Strategy:
1. Parse .3dm → Extract meshes
2. Create minimal IFC file with geometries
3. Convert IFC → Fragments using @thatopen/components CLI
4. Generate properties sidecar JSON

Alternative (if IFC bridge fails):
- Export to glTF as intermediate
- Use ThatOpen's fragment builder from glTF
- This is actually more practical for POC

Usage:
    python export_thatopen_frag.py

Output:
    - dataset/fragments/sagrada-sample.frag
    - dataset/fragments/sagrada-sample.frag.json (properties)
"""

import os
import sys
import json
import hashlib
import subprocess
from pathlib import Path
from typing import List, Dict

import rhino3dm as r3dm
import trimesh
import numpy as np
from tqdm import tqdm

# Configuración
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent
RAW_DIR = PROJECT_ROOT / "dataset" / "raw"
OUTPUT_DIR = PROJECT_ROOT / "dataset" / "fragments"
TEMP_DIR = OUTPUT_DIR / "temp"

# Parámetros
TARGET_FACES = 1000


class RhinoToFragmentsExporter:
    """
    Exporter de .3dm a ThatOpen Fragments.
    
    Flow:
    1. Parse all .3dm files
    2. Create IFC file with all geometries (using ifcopenshell)
    3. Convert IFC → Fragments (using Node.js @thatopen/components-cli)
    4. Generate properties JSON sidecar
    """
    
    def __init__(self):
        self.metrics = {
            "files_processed": 0,
            "total_faces": 0,
            "size_ifc_mb": 0,
            "size_frag_mb": 0,
            "size_props_kb": 0,
            "instances_detected": 0,
        }
        self.geometry_hashes = {}
        self.all_meshes = []  # Store all meshes for batch processing
        self.metadata = []    # Store metadata for properties JSON
    
    def parse_rhino_file(self, file_path: Path) -> List[Dict]:
        """Parse .3dm and return mesh data + metadata."""
        print(f"\n📂 Parsing {file_path.name}...")
        
        try:
            file3dm = r3dm.File3dm.Read(str(file_path))
        except Exception as e:
            print(f"❌ Error reading {file_path.name}: {e}")
            return []
        
        meshes_data = []
        brep_count = 0
        mesh_count = 0
        
        for idx, obj in enumerate(file3dm.Objects):
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
            for i in range(len(rhino_mesh.Vertices)):
                v = rhino_mesh.Vertices[i]
                vertices.append([v.X, v.Y, v.Z])
            
            faces = []
            for i in range(len(rhino_mesh.Faces)):
                f = rhino_mesh.Faces[i]  # Tuple like (0, 3, 2, 1) for quad or (0, 1, 2) for tri
                if len(f) == 4:  # Quad
                    faces.append([f[0], f[1], f[2]])
                    faces.append([f[2], f[3], f[0]])
                elif len(f) == 3:  # Triangle
                    faces.append([f[0], f[1], f[2]])
            
            if not vertices or not faces:
                continue
            
            try:
                mesh = trimesh.Trimesh(
                    vertices=np.array(vertices),
                    faces=np.array(faces),
                    process=True
                )
                
                # Decimate
                if len(mesh.faces) > TARGET_FACES:
                    mesh = mesh.simplify_quadric_decimation(TARGET_FACES)
                
                # Compute hash for instancing detection
                geom_hash = hashlib.sha256(mesh.vertices.tobytes()).hexdigest()[:16]
                
                # Store mesh data
                mesh_data = {
                    "mesh": mesh,
                    "name": f"{file_path.stem}-{idx}",
                    "source_file": file_path.name,
                    "geometry_hash": geom_hash,
                    "face_count": len(mesh.faces),
                    "vertex_count": len(mesh.vertices),
                }
                
                meshes_data.append(mesh_data)
                
                print(f"  ✓ Mesh {idx}: {len(vertices)} verts, {len(faces)} faces → {len(mesh.faces)} decimated")
                
            except Exception as e:
                print(f"  ⚠️  Skipping mesh {idx}: {e}")
        
        print(f"\n📊 Parsing summary:")
        print(f"  • Meshes processed: {mesh_count}")
        if brep_count > 0:
            print(f"  • Breps skipped: {brep_count} (rhino3dm API limitation)")
        
        return meshes_data
    
    def detect_instances(self, meshes_data: List[Dict]):
        """Detect duplicate geometries for instancing."""
        hash_map = {}
        
        for data in meshes_data:
            geom_hash = data["geometry_hash"]
            
            if geom_hash not in hash_map:
                hash_map[geom_hash] = {
                    "master": data["name"],
                    "instances": []
                }
            else:
                hash_map[geom_hash]["instances"].append(data["name"])
                data["is_instance"] = True
                data["instance_of"] = hash_map[geom_hash]["master"]
        
        # Count total instances
        total_instances = sum(len(v["instances"]) for v in hash_map.values())
        self.metrics["instances_detected"] = total_instances
        
        print(f"\n🔄 Instancing Analysis:")
        print(f"  Unique geometries: {len(hash_map)}")
        print(f"  Total instances:   {total_instances}")
        
        for geom_hash, info in hash_map.items():
            if info["instances"]:
                print(f"  - {info['master']}: {len(info['instances'])} instances")
    
    def create_ifc_file(self, meshes_data: List[Dict]) -> Path:
        """
        Create minimal IFC file with geometries.
        
        NOTE: This requires ifcopenshell which is complex to install.
        For POC, we'll skip this and use glTF → Fragments bridge instead.
        """
        print("\n⚠️  IFC creation not implemented (requires ifcopenshell)")
        print("   Using alternative: glTF → Fragments bridge")
        return None
    
    def export_via_gltf_bridge(self, meshes_data: List[Dict]):
        """
        Alternative approach: Export to glTF, then convert to Fragments via Node.js.
        
        This is more practical for POC since ThatOpen can load glTF and convert.
        """
        print("\n🌉 Using glTF bridge to Fragments...")
        
        # Export combined glTF
        combined_mesh = trimesh.util.concatenate([d["mesh"] for d in meshes_data])
        
        TEMP_DIR.mkdir(parents=True, exist_ok=True)
        gltf_path = TEMP_DIR / "combined.glb"
        
        print(f"  💾 Exporting combined mesh to glTF...")
        combined_mesh.export(str(gltf_path), file_type='glb')
        
        gltf_size = gltf_path.stat().st_size / (1024 * 1024)
        print(f"  ✓ glTF exported: {gltf_size:.2f} MB")
        
        # Convert glTF → Fragments using Node.js script
        # (We'll create a separate Node.js script for this)
        print(f"\n  ℹ️  To convert to Fragments, run:")
        print(f"     node exporters/convert-gltf-to-fragments.js")
        
        return gltf_path
    
    def generate_properties_json(self, meshes_data: List[Dict]):
        """Generate properties sidecar JSON for ThatOpen."""
        properties = {
            "modelId": "sagrada-sample",
            "version": "1.0",
            "exportDate": "2026-02-18",
            "items": []
        }
        
        for data in meshes_data:
            item = {
                "id": data["geometry_hash"],
                "name": data["name"],
                "type": "Block",  # Generic type
                "properties": {
                    "iso_code": data["name"],
                    "source_file": data["source_file"],
                    "face_count": data["face_count"],
                    "vertex_count": data["vertex_count"],
                    "is_instance": data.get("is_instance", False),
                    "instance_of": data.get("instance_of", None),
                },
                "boundingBox": self._compute_bbox(data["mesh"])
            }
            properties["items"].append(item)
        
        # Export
        props_path = OUTPUT_DIR / "sagrada-sample.frag.json"
        with open(props_path, "w") as f:
            json.dump(properties, f, indent=2)
        
        props_size = props_path.stat().st_size / 1024
        self.metrics["size_props_kb"] = props_size
        
        print(f"\n📄 Properties JSON exported: {props_size:.1f} KB")
        return props_path
    
    def _compute_bbox(self, mesh: trimesh.Trimesh) -> Dict:
        """Compute bounding box for mesh."""
        bbox = mesh.bounds
        return {
            "min": bbox[0].tolist(),
            "max": bbox[1].tolist()
        }
    
    def print_summary(self):
        """Print export summary."""
        print(f"\n{'='*60}")
        print("📊 EXPORT SUMMARY - ThatOpen Fragments")
        print(f"{'='*60}")
        print(f"Files processed:        {self.metrics['files_processed']}")
        print(f"Total faces:            {self.metrics['total_faces']:,}")
        print(f"Instances detected:     {self.metrics['instances_detected']}")
        print(f"\nProperties JSON:        {self.metrics['size_props_kb']:.1f} KB")
        print(f"\n⚠️  Note: Fragment file (.frag) must be generated via Node.js")
        print(f"   Run: node exporters/convert-gltf-to-fragments.js")
        print(f"\n✅ Output directory: {OUTPUT_DIR}")
        print(f"{'='*60}\n")
    
    def export_metrics(self):
        """Export metrics JSON."""
        metrics_path = PROJECT_ROOT / "results" / "fragments-metrics.json"
        metrics_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metrics_path, "w") as f:
            json.dump(self.metrics, f, indent=2)
        
        print(f"📊 Metrics exported to: {metrics_path}")


def main():
    """Main entry point."""
    print("🚀 ThatOpen Fragments Exporter for POC")
    print("=" * 60)
    
    # Check raw directory
    if not RAW_DIR.exists():
        print(f"❌ Raw directory not found: {RAW_DIR}")
        sys.exit(1)
    
    rhino_files = list(RAW_DIR.glob("*.3dm"))
    if not rhino_files:
        print(f"❌ No .3dm files found in {RAW_DIR}")
        sys.exit(1)
    
    print(f"Found {len(rhino_files)} .3dm files\n")
    
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Initialize exporter
    exporter = RhinoToFragmentsExporter()
    
    # Parse all files
    all_meshes_data = []
    for file_path in rhino_files:
        meshes_data = exporter.parse_rhino_file(file_path)
        all_meshes_data.extend(meshes_data)
        exporter.metrics["files_processed"] += 1
    
    exporter.metrics["total_faces"] = sum(d["face_count"] for d in all_meshes_data)
    
    # Detect instances
    exporter.detect_instances(all_meshes_data)
    
    # Export via glTF bridge (practical approach)
    gltf_path = exporter.export_via_gltf_bridge(all_meshes_data)
    
    # Generate properties JSON
    exporter.generate_properties_json(all_meshes_data)
    
    # Summary
    exporter.print_summary()
    exporter.export_metrics()
    
    print("\n📝 Next Steps:")
    print("   1. Install @thatopen/components: npm install -g @thatopen/components-cli")
    print("   2. Convert glTF to Fragments:")
    print("      cd dataset/fragments/temp")
    print("      thatopen-convert combined.glb --output ../sagrada-sample.frag")
    print("\n   Alternative: Use the Node.js script (if created)")
    print("      node exporters/convert-gltf-to-fragments.js")


if __name__ == "__main__":
    main()
