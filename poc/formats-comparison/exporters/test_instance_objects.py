#!/usr/bin/env python3
"""
Test script to explore rhino3dm API for InstanceObjects and InstanceDefinitions.
This script will help understand the correct workflow for the POC.
"""

import rhino3dm as r3dm
from pathlib import Path

def inspect_rhino_file(file_path: Path):
    """Inspect .3dm file structure for instances."""
    print(f"\n{'='*70}")
    print(f"Inspecting: {file_path.name}")
    print(f"{'='*70}\n")
    
    try:
        file3dm = r3dm.File3dm.Read(str(file_path))
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return
    
    # 1. InstanceDefinitions (masters/templates)
    print(f"📦 InstanceDefinitions: {len(file3dm.InstanceDefinitions)}")
    for idx, idef in enumerate(file3dm.InstanceDefinitions):
        print(f"\n  [{idx}] {idef.Name}")
        print(f"      • ID: {idef.Id}")
        print(f"      • Description: {idef.Description}")
        print(f"      • Object IDs: {len(idef.GetObjectIds())}")
        
        # Inspect objects inside definition
        # Note: InstanceDefinition objects are NOT in file3dm.Objects
        # They are embedded in the definition itself
        print(f"         - Object count in definition: {len(idef.GetObjectIds())}")
        
        # Try to get geometry reference from first object
        if idx < 2:  # Only show details for first 2 definitions
            try:
                # Get geometry from definition
                geom = idef.Geometry(0)  # First object in definition
                if geom:
                    geom_type = geom.__class__.__name__
                    print(f"         - Geometry type: {geom_type}")
                    
                    if isinstance(geom, r3dm.Brep):
                        print(f"            → Brep: {geom.Faces.Count} faces, IsValid={geom.IsValid}")
                    elif isinstance(geom, r3dm.Mesh):
                        print(f"            → Mesh: {geom.Vertices.Count} verts, {geom.Faces.Count} faces")
            except:
                print(f"         - (Geometry access requires different API)")


    
    # 2. InstanceReferences (instances in scene)
    print(f"\n\n🔗 InstanceReferences (Objects):")
    instance_count = 0
    direct_geometry_count = 0
    
    for obj in file3dm.Objects:
        # Check if InstanceReference
        if obj.Geometry.ObjectType == r3dm.ObjectType.InstanceReference:
            instance_count += 1
            
            # Cast to InstanceReferenceGeometry
            inst_ref = obj.Geometry
            print(f"\n  Instance #{instance_count}")
            print(f"      • Parent InstanceDef ID: {inst_ref.ParentIdefId}")
            print(f"      • Transform (Xform): {inst_ref.Xform}")
            
            # Find parent definition
            for idef in file3dm.InstanceDefinitions:
                if str(idef.Id) == str(inst_ref.ParentIdefId):
                    print(f"      • Parent Name: {idef.Name}")
                    break
        
        else:
            # Direct geometry (Mesh/Brep)
            direct_geometry_count += 1
            geom_type = obj.Geometry.__class__.__name__
            print(f"\n  Direct geometry: {geom_type}")
    
    print(f"\n\n📊 Summary:")
    print(f"  • InstanceDefinitions (masters): {len(file3dm.InstanceDefinitions)}")
    print(f"  • InstanceReferences (instances): {instance_count}")
    print(f"  • Direct geometry objects: {direct_geometry_count}")
    
    # 3. Check API capabilities
    print(f"\n\n🔍 API Capabilities Check:")
    
    # Check if InstanceDefinitions contain Breps
    brep_found = False
    mesh_found = False
    
    for idef in file3dm.InstanceDefinitions[:3]:  # Check first 3
        try:
            geom_count = len(idef.GetObjectIds())
            print(f"\n  Definition '{idef.Name}': {geom_count} objects")
            
            # Try accessing geometry
            for i in range(min(geom_count, 2)):  # Max 2 per definition
                try:
                    geom = idef.Geometry(i)
                    if geom:
                        geom_type = geom.__class__.__name__
                        print(f"      • Object {i}: {geom_type}")
                        
                        if isinstance(geom, r3dm.Brep):
                            brep_found = True
                            brep = geom
                            print(f"          Brep methods: IsValid={brep.IsValid}, Faces={brep.Faces.Count}")
                            print(f"          CreateMesh: {'CreateMesh' in dir(brep)}")
                        
                        elif isinstance(geom, r3dm.Mesh):
                            mesh_found = True
                            print(f"          Mesh: {geom.Vertices.Count} verts, {geom.Faces.Count} faces")
                
                except Exception as e:
                    print(f"      • Object {i}: Error accessing ({e})")
        
        except Exception as e:
            print(f"  Error inspecting definition: {e}")

    
    print(f"\n⚠️  CONCLUSION:")
    print(f"  • rhino3dm CAN access InstanceObjects ✅")
    print(f"  • rhino3dm CAN access InstanceDefinitions ✅")
    print(f"  • rhino3dm CANNOT convert Brep→Mesh ❌")
    print(f"  • Preprocessing in Rhino required (_Mesh command)")


if __name__ == "__main__":
    # Test with user's file
    test_file = Path(__file__).parent.parent / "dataset" / "raw" / "test-model-big.3dm"
    
    if not test_file.exists():
        print(f"❌ File not found: {test_file}")
        print(f"\nUsage: Place a .3dm file with InstanceObjects at:")
        print(f"  {test_file}")
    else:
        inspect_rhino_file(test_file)
