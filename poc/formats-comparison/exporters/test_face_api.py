#!/usr/bin/env python3
"""Quick test of rhino3dm Mesh Face API"""
import rhino3dm as r3dm
from pathlib import Path

script_dir = Path(__file__).parent
file_path = script_dir.parent / "dataset" / "raw" / "test-model-big.3dm"

print(f"Loading: {file_path}")
file3dm = r3dm.File3dm.Read(str(file_path))

if not file3dm:
    print(f"❌ Failed to read file")
    exit(1)

for obj in file3dm.Objects:
    if isinstance(obj.Geometry, r3dm.Mesh):
        mesh = obj.Geometry
        print(f"✅ Found Mesh: {len(mesh.Vertices)} verts, {len(mesh.Faces)} faces")
        
        if len(mesh.Faces) > 0:
            face = mesh.Faces[0]
            print(f"\nFace[0] type: {type(face)}")
            print(f"Face[0] value: {face}")
            
            # Check if MeshFace object or tuple
            if hasattr(face, 'IsQuad'):
                print(f"✅ MeshFace object - IsQuad: {face.IsQuad}")
                print(f"   A={face.A}, B={face.B}, C={face.C}, D={face.D}")
            else:
                print(f"⚠️  Tuple/List: length={len(face)}, values={face}")
        break
else:
    print("❌ No Mesh found")
