#!/usr/bin/env python3
"""
Generate synthetic .3dm file with Mesh geometry for POC testing.
Creates 5 simple mesh objects (cube, sphere, cylinder, torus, cone).
"""

import rhino3dm as r3dm
from pathlib import Path
import math

def create_cube_mesh(size=1.0):
    """Create a cube mesh."""
    mesh = r3dm.Mesh()
    
    # 8 vertices
    mesh.Vertices.Add(0, 0, 0)
    mesh.Vertices.Add(size, 0, 0)
    mesh.Vertices.Add(size, size, 0)
    mesh.Vertices.Add(0, size, 0)
    mesh.Vertices.Add(0, 0, size)
    mesh.Vertices.Add(size, 0, size)
    mesh.Vertices.Add(size, size, size)
    mesh.Vertices.Add(0, size, size)
    
    # 12 triangular faces (2 per side)
    faces = [
        # Bottom
        (0, 1, 2), (0, 2, 3),
        # Top
        (4, 6, 5), (4, 7, 6),
        # Front
        (0, 5, 1), (0, 4, 5),
        # Back
        (2, 7, 3), (2, 6, 7),
        # Left
        (0, 7, 4), (0, 3, 7),
        # Right
        (1, 6, 2), (1, 5, 6),
    ]
    
    for a, b, c in faces:
        mesh.Faces.AddFace(a, b, c)
    
    mesh.Normals.ComputeNormals()
    mesh.Compact()
    
    return mesh

def create_icosphere_mesh(radius=1.0, subdivisions=2):
    """Create an icosphere (approximation using triangular mesh)."""
    mesh = r3dm.Mesh()
    
    # Golden ratio
    t = (1.0 + math.sqrt(5.0)) / 2.0
    
    # 12 vertices of icosahedron
    vertices = [
        (-1, t, 0), (1, t, 0), (-1, -t, 0), (1, -t, 0),
        (0, -1, t), (0, 1, t), (0, -1, -t), (0, 1, -t),
        (t, 0, -1), (t, 0, 1), (-t, 0, -1), (-t, 0, 1),
    ]
    
    # Normalize to radius
    for x, y, z in vertices:
        length = math.sqrt(x*x + y*y + z*z)
        mesh.Vertices.Add(
            radius * x / length,
            radius * y / length,
            radius * z / length
        )
    
    # 20 faces
    faces = [
        (0, 11, 5), (0, 5, 1), (0, 1, 7), (0, 7, 10), (0, 10, 11),
        (1, 5, 9), (5, 11, 4), (11, 10, 2), (10, 7, 6), (7, 1, 8),
        (3, 9, 4), (3, 4, 2), (3, 2, 6), (3, 6, 8), (3, 8, 9),
        (4, 9, 5), (2, 4, 11), (6, 2, 10), (8, 6, 7), (9, 8, 1),
    ]
    
    for a, b, c in faces:
        mesh.Faces.AddFace(a, b, c)
    
    mesh.Normals.ComputeNormals()
    mesh.Compact()
    
    return mesh

def create_cylinder_mesh(radius=1.0, height=2.0, segments=12):
    """Create a cylinder mesh."""
    mesh = r3dm.Mesh()
    
    # Bottom circle vertices
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        mesh.Vertices.Add(x, y, 0)
    
    # Top circle vertices
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        mesh.Vertices.Add(x, y, height)
    
    # Center vertices
    mesh.Vertices.Add(0, 0, 0)  # Bottom center
    mesh.Vertices.Add(0, 0, height)  # Top center
    
    bottom_center = segments * 2
    top_center = segments * 2 + 1
    
    # Bottom cap
    for i in range(segments):
        next_i = (i + 1) % segments
        mesh.Faces.AddFace(bottom_center, i, next_i)
    
    # Top cap
    for i in range(segments):
        next_i = (i + 1) % segments
        mesh.Faces.AddFace(top_center, segments + next_i, segments + i)
    
    # Side faces
    for i in range(segments):
        next_i = (i + 1) % segments
        # Two triangles per segment
        mesh.Faces.AddFace(i, next_i, segments + i)
        mesh.Faces.AddFace(next_i, segments + next_i, segments + i)
    
    mesh.Normals.ComputeNormals()
    mesh.Compact()
    
    return mesh

def create_cone_mesh(radius=1.0, height=2.0, segments=12):
    """Create a cone mesh."""
    mesh = r3dm.Mesh()
    
    # Base circle
    for i in range(segments):
        angle = 2 * math.pi * i / segments
        x = radius * math.cos(angle)
        y = radius * math.sin(angle)
        mesh.Vertices.Add(x, y, 0)
    
    # Apex
    mesh.Vertices.Add(0, 0, height)
    apex = segments
    
    # Base center
    mesh.Vertices.Add(0, 0, 0)
    base_center = segments + 1
    
    # Base cap
    for i in range(segments):
        next_i = (i + 1) % segments
        mesh.Faces.AddFace(base_center, next_i, i)
    
    # Side faces
    for i in range(segments):
        next_i = (i + 1) % segments
        mesh.Faces.AddFace(i, next_i, apex)
    
    mesh.Normals.ComputeNormals()
    mesh.Compact()
    
    return mesh

def main():
    """Generate test .3dm file with 5 mesh objects."""
    print("🔧 Generating synthetic test meshes for POC...")
    
    file3dm = r3dm.File3dm()
    
    # Create 5 different meshes at different positions
    meshes = [
        ("cube", create_cube_mesh(2.0), (0, 0, 0)),
        ("sphere", create_icosphere_mesh(1.5), (5, 0, 0)),
        ("cylinder", create_cylinder_mesh(1.0, 3.0), (10, 0, 0)),
        ("cone", create_cone_mesh(1.5, 3.0), (15, 0, 0)),
        ("cube_copy", create_cube_mesh(2.0), (20, 0, 0)),  # Duplicate for instancing test
    ]
    
    for name, mesh, (dx, dy, dz) in meshes:
        # Translate mesh
        translated = r3dm.Mesh()
        for i in range(mesh.Vertices.Count):
            v = mesh.Vertices[i]
            translated.Vertices.Add(v.X + dx, v.Y + dy, v.Z + dz)
        
        for i in range(mesh.Faces.Count):
            f = mesh.Faces[i]
            if f.IsQuad:
                translated.Faces.AddFace(f.A, f.B, f.C, f.D)
            else:
                translated.Faces.AddFace(f.A, f.B, f.C)
        
        translated.Normals.ComputeNormals()
        translated.Compact()
        
        # Add to file
        attrs = r3dm.ObjectAttributes()
        attrs.Name = name
        attrs.ObjectColor = (255, 255, 255, 255)
        
        file3dm.Objects.AddMesh(translated, attrs)
        
        print(f"  ✓ {name}: {translated.Vertices.Count} verts, {translated.Faces.Count} faces")
    
    # Save file
    output_dir = Path(__file__).parent.parent / "dataset" / "raw"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_path = output_dir / "test-synthetic-meshes.3dm"
    file3dm.Write(str(output_path), 7)  # Version 7 (Rhino 7)
    
    size_kb = output_path.stat().st_size / 1024
    print(f"\n✅ Generated: {output_path.name} ({size_kb:.2f} KB)")
    print(f"   Location: {output_path}")
    print(f"\nNext step: bash run-gltf-export.sh")

if __name__ == "__main__":
    main()
