# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

from fastapi import APIRouter, HTTPException, Request
import json
import re
import xml.etree.ElementTree as ET

from database import db

router = APIRouter(tags=["tools"])


# ==================== BPMN VALIDATION ====================

@router.post("/diagrams/{diagram_id}/validate")
async def validate_diagram(diagram_id: str):
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    xml_str = diagram.get("current_xml", "")
    return validate_bpmn_xml(xml_str)


@router.post("/validate-xml")
async def validate_xml_direct(request: Request):
    body = await request.json()
    xml_str = body.get("xml", "")
    return validate_bpmn_xml(xml_str)


def validate_bpmn_xml(xml_str: str):
    errors = []
    warnings = []
    info = []
    
    if not xml_str or len(xml_str.strip()) < 10:
        return {"valid": False, "errors": [{"type": "error", "message": "XML vacio o invalido", "element": None}], "warnings": [], "info": [], "score": 0}
    
    try:
        root = ET.fromstring(xml_str)
    except ET.ParseError as e:
        return {"valid": False, "errors": [{"type": "error", "message": f"XML malformado: {str(e)}", "element": None}], "warnings": [], "info": [], "score": 0}
    
    ns = {
        "bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL",
        "bpmndi": "http://www.omg.org/spec/BPMN/20100524/DI",
    }
    
    tag = root.tag.split("}")[-1] if "}" in root.tag else root.tag
    if tag != "definitions":
        errors.append({"type": "error", "message": "Elemento raiz debe ser bpmn:definitions", "element": None})
    
    processes = root.findall(".//bpmn:process", ns)
    if not processes:
        errors.append({"type": "error", "message": "No se encontro ningun proceso (bpmn:process)", "element": None})
    
    for proc in processes:
        pid = proc.get("id", "unknown")
        
        starts = proc.findall("bpmn:startEvent", ns)
        if not starts:
            errors.append({"type": "error", "message": f"Proceso '{pid}' no tiene evento de inicio", "element": pid})
        elif len(starts) > 1:
            warnings.append({"type": "warning", "message": f"Proceso '{pid}' tiene multiples eventos de inicio ({len(starts)})", "element": pid})
        
        ends = proc.findall("bpmn:endEvent", ns)
        if not ends:
            warnings.append({"type": "warning", "message": f"Proceso '{pid}' no tiene evento de fin", "element": pid})
        
        tasks = proc.findall(".//bpmn:task", ns) + proc.findall(".//bpmn:userTask", ns) + proc.findall(".//bpmn:serviceTask", ns) + proc.findall(".//bpmn:scriptTask", ns) + proc.findall(".//bpmn:sendTask", ns) + proc.findall(".//bpmn:receiveTask", ns) + proc.findall(".//bpmn:manualTask", ns) + proc.findall(".//bpmn:businessRuleTask", ns)
        for task in tasks:
            tid = task.get("id", "unknown")
            name = task.get("name", "")
            if not name.strip():
                warnings.append({"type": "warning", "message": f"Tarea '{tid}' no tiene nombre", "element": tid})
        
        gateways = proc.findall(".//bpmn:exclusiveGateway", ns) + proc.findall(".//bpmn:parallelGateway", ns) + proc.findall(".//bpmn:inclusiveGateway", ns)
        for gw in gateways:
            gid = gw.get("id", "unknown")
            outgoing = gw.findall("bpmn:outgoing", ns)
            if len(outgoing) < 2:
                warnings.append({"type": "warning", "message": f"Gateway '{gid}' deberia tener al menos 2 flujos de salida", "element": gid})
        
        flows = proc.findall("bpmn:sequenceFlow", ns)
        all_ids = set(child.get("id", "") for child in proc)
        for flow in flows:
            fid = flow.get("id", "unknown")
            source = flow.get("sourceRef", "")
            target = flow.get("targetRef", "")
            if source and source not in all_ids:
                errors.append({"type": "error", "message": f"Flujo '{fid}' referencia origen inexistente: {source}", "element": fid})
            if target and target not in all_ids:
                errors.append({"type": "error", "message": f"Flujo '{fid}' referencia destino inexistente: {target}", "element": fid})
        
        info.append({"type": "info", "message": f"Tareas: {len(tasks)}, Gateways: {len(gateways)}, Flujos: {len(flows)}, Eventos inicio: {len(starts)}, Eventos fin: {len(ends)}", "element": pid})
    
    diagrams = root.findall(".//bpmndi:BPMNDiagram", ns)
    if not diagrams:
        warnings.append({"type": "warning", "message": "No se encontro BPMNDiagram (sin representacion visual)", "element": None})
    
    score = 100
    score -= len(errors) * 20
    score -= len(warnings) * 5
    score = max(0, min(100, score))
    
    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
        "info": info,
        "score": score,
    }


# ==================== UML GENERATION ====================

@router.post("/diagrams/{diagram_id}/generate-uml")
async def generate_uml(diagram_id: str):
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    oop_classes = await db.oop_classes.find({}, {"_id": 0}).to_list(100)
    oop_map = {c["name"]: c for c in oop_classes}
    
    xml_str = diagram.get("current_xml", "")
    ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
    
    classes = []
    relationships = []
    used_classes = set()
    
    try:
        root = ET.fromstring(xml_str)
        processes = root.findall(".//bpmn:process", ns)
        
        for proc in processes:
            tasks = []
            for tag_name in ["task", "userTask", "serviceTask", "scriptTask", "sendTask", "receiveTask", "manualTask", "businessRuleTask"]:
                tasks.extend(proc.findall(f".//bpmn:{tag_name}", ns))
            
            for task in tasks:
                tid = task.get("id", "")
                tname = task.get("name", tid)
                
                docs = task.findall("bpmn:documentation", ns)
                input_class = None
                output_class = None
                
                for doc in docs:
                    text = doc.text or ""
                    match = re.search(r'\[OOP_IO\](.*?)\[/OOP_IO\]', text, re.DOTALL)
                    if match:
                        try:
                            io_data = json.loads(match.group(1))
                            ic = io_data.get("inputClass", "")
                            oc = io_data.get("outputClass", "")
                            if ic and ic != "__none__":
                                input_class = ic
                            if oc and oc != "__none__":
                                output_class = oc
                            if not input_class:
                                input_class = io_data.get("inputCustom")
                            if not output_class:
                                output_class = io_data.get("outputCustom")
                        except:
                            pass
                
                if input_class:
                    used_classes.add(input_class)
                if output_class:
                    used_classes.add(output_class)
                
                if input_class and output_class and input_class != output_class:
                    relationships.append({
                        "from": input_class,
                        "to": output_class,
                        "type": "dependency",
                        "label": tname,
                    })
    except:
        pass
    
    for cls_name in used_classes:
        oop = oop_map.get(cls_name)
        if oop:
            classes.append({
                "name": cls_name,
                "type": "class",
                "properties": oop.get("properties", []),
                "category": oop.get("category", ""),
                "description": oop.get("description", ""),
            })
        else:
            classes.append({
                "name": cls_name,
                "type": "custom",
                "properties": [],
                "category": "custom",
                "description": "",
            })
    
    return {
        "classes": classes,
        "relationships": relationships,
        "diagram_name": diagram.get("name", ""),
    }


# ==================== BPMN SIMULATION ====================

@router.post("/diagrams/{diagram_id}/simulate")
async def simulate_diagram(diagram_id: str):
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    xml_str = diagram.get("current_xml", "")
    return generate_simulation(xml_str)


def get_step_description(element_type: str, name: str) -> str:
    type_descs = {
        "startEvent": "Inicio del proceso",
        "endEvent": "Fin del proceso",
        "task": f"Ejecutar tarea: {name}",
        "userTask": f"Tarea de usuario: {name}",
        "serviceTask": f"Servicio automatico: {name}",
        "scriptTask": f"Script: {name}",
        "sendTask": f"Enviar: {name}",
        "receiveTask": f"Recibir: {name}",
        "manualTask": f"Tarea manual: {name}",
        "businessRuleTask": f"Regla de negocio: {name}",
        "exclusiveGateway": f"Decision exclusiva: {name}",
        "parallelGateway": f"Bifurcacion paralela: {name}",
        "inclusiveGateway": f"Decision inclusiva: {name}",
        "intermediateCatchEvent": f"Esperar evento: {name}",
        "intermediateThrowEvent": f"Lanzar evento: {name}",
    }
    return type_descs.get(element_type, f"Elemento: {name}")


def generate_simulation(xml_str: str):
    ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
    steps = []
    
    try:
        root = ET.fromstring(xml_str)
        processes = root.findall(".//bpmn:process", ns)
        
        for proc in processes:
            elements = {}
            flows = {}
            start_ids = []
            
            for child in proc:
                tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
                eid = child.get("id", "")
                if not eid:
                    continue
                
                if tag == "sequenceFlow":
                    source = child.get("sourceRef", "")
                    target = child.get("targetRef", "")
                    name = child.get("name", "")
                    if source not in flows:
                        flows[source] = []
                    flows[source].append({"target": target, "name": name, "id": eid})
                else:
                    elements[eid] = {
                        "id": eid,
                        "name": child.get("name", eid),
                        "type": tag,
                    }
                    if tag == "startEvent":
                        start_ids.append(eid)
            
            visited = set()
            queue = list(start_ids)
            step_num = 0
            
            while queue:
                current_id = queue.pop(0)
                if current_id in visited:
                    continue
                visited.add(current_id)
                
                el = elements.get(current_id)
                if not el:
                    continue
                
                step_num += 1
                step_type = "task"
                if "Gateway" in el["type"] or "gateway" in el["type"]:
                    step_type = "gateway"
                elif "Event" in el["type"] or "event" in el["type"]:
                    step_type = "event"
                
                next_elements = flows.get(current_id, [])
                
                steps.append({
                    "step": step_num,
                    "element_id": current_id,
                    "element_name": el["name"],
                    "element_type": el["type"],
                    "step_type": step_type,
                    "next": [{"element_id": n["target"], "condition": n["name"]} for n in next_elements],
                    "description": get_step_description(el["type"], el["name"]),
                })
                
                for n in next_elements:
                    if n["target"] not in visited:
                        queue.append(n["target"])
    except Exception as e:
        return {"steps": [], "error": str(e)}
    
    return {"steps": steps, "total_steps": len(steps)}


# ==================== DOCUMENTATION GENERATION ====================

@router.post("/diagrams/{diagram_id}/generate-docs")
async def generate_documentation(diagram_id: str, request: Request):
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    xml_str = diagram.get("current_xml", "")
    ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
    
    doc_lines = []
    doc_lines.append(f"# {diagram.get('name', 'Diagrama BPMN')}")
    doc_lines.append(f"\n{diagram.get('description', '')}")
    doc_lines.append(f"\n**Version**: {diagram.get('current_version', 1)}")
    doc_lines.append(f"**Actualizado**: {diagram.get('updated_at', '')}")
    doc_lines.append("\n---\n")
    
    try:
        root = ET.fromstring(xml_str)
        processes = root.findall(".//bpmn:process", ns)
        
        for proc in processes:
            pname = proc.get("name", proc.get("id", "Proceso"))
            doc_lines.append(f"## Proceso: {pname}\n")
            
            tasks = []
            for tag in ["task", "userTask", "serviceTask", "scriptTask", "sendTask", "receiveTask", "manualTask", "businessRuleTask"]:
                tasks.extend(proc.findall(f".//bpmn:{tag}", ns))
            
            if tasks:
                doc_lines.append("### Tareas\n")
                doc_lines.append("| # | Nombre | Tipo | ID |")
                doc_lines.append("|---|--------|------|----|")
                for i, task in enumerate(tasks, 1):
                    ttype = task.tag.split("}")[-1] if "}" in task.tag else task.tag
                    doc_lines.append(f"| {i} | {task.get('name', '-')} | {ttype} | `{task.get('id', '')}` |")
                doc_lines.append("")
            
            gateways = []
            for tag in ["exclusiveGateway", "parallelGateway", "inclusiveGateway"]:
                gateways.extend(proc.findall(f".//bpmn:{tag}", ns))
            
            if gateways:
                doc_lines.append("### Decisiones (Gateways)\n")
                for gw in gateways:
                    gtype = gw.tag.split("}")[-1] if "}" in gw.tag else gw.tag
                    doc_lines.append(f"- **{gw.get('name', gw.get('id', '-'))}** ({gtype})")
                doc_lines.append("")
            
            events = proc.findall(".//bpmn:startEvent", ns) + proc.findall(".//bpmn:endEvent", ns) + proc.findall(".//bpmn:intermediateCatchEvent", ns) + proc.findall(".//bpmn:intermediateThrowEvent", ns)
            if events:
                doc_lines.append("### Eventos\n")
                for ev in events:
                    etype = ev.tag.split("}")[-1] if "}" in ev.tag else ev.tag
                    doc_lines.append(f"- **{ev.get('name', ev.get('id', '-'))}** ({etype})")
                doc_lines.append("")
            
            seq_flows = proc.findall("bpmn:sequenceFlow", ns)
            if seq_flows:
                doc_lines.append("### Flujos de Secuencia\n")
                doc_lines.append(f"Total: {len(seq_flows)} conexiones\n")
                for flow in seq_flows:
                    cond = flow.get("name", "")
                    if cond:
                        doc_lines.append(f"- `{flow.get('sourceRef', '')}` → `{flow.get('targetRef', '')}` *({cond})*")
                doc_lines.append("")
    except:
        doc_lines.append("\n*Error al parsear XML del diagrama*\n")
    
    tags = diagram.get("tags", [])
    if tags:
        doc_lines.append("\n### Etiquetas\n")
        doc_lines.append(", ".join([f"`{t}`" for t in tags]))
    
    markdown = "\n".join(doc_lines)
    return {"markdown": markdown, "diagram_name": diagram.get("name", "")}


# ==================== ANALYTICS ====================

@router.post("/diagrams/{diagram_id}/analytics")
async def get_diagram_analytics(diagram_id: str):
    diagram = await db.diagrams.find_one({"id": diagram_id}, {"_id": 0})
    if not diagram:
        raise HTTPException(status_code=404, detail="Diagram not found")
    
    xml_str = diagram.get("current_xml", "")
    ns = {"bpmn": "http://www.omg.org/spec/BPMN/20100524/MODEL"}
    
    metrics = {
        "tasks": 0, "gateways": 0, "events": 0, "flows": 0,
        "user_tasks": 0, "service_tasks": 0, "script_tasks": 0,
        "exclusive_gw": 0, "parallel_gw": 0, "inclusive_gw": 0,
        "start_events": 0, "end_events": 0,
        "complexity_score": 0, "complexity_level": "simple",
        "estimated_paths": 1, "bottlenecks": [],
        "unnamed_elements": 0, "process_count": 0,
    }
    
    try:
        root = ET.fromstring(xml_str)
        processes = root.findall(".//bpmn:process", ns)
        metrics["process_count"] = len(processes)
        
        incoming_count = {}
        outgoing_count = {}
        
        for proc in processes:
            for tag in ["task", "userTask", "serviceTask", "scriptTask", "sendTask", "receiveTask", "manualTask", "businessRuleTask"]:
                found = proc.findall(f".//bpmn:{tag}", ns)
                metrics["tasks"] += len(found)
                if tag == "userTask":
                    metrics["user_tasks"] += len(found)
                elif tag == "serviceTask":
                    metrics["service_tasks"] += len(found)
                elif tag == "scriptTask":
                    metrics["script_tasks"] += len(found)
                for el in found:
                    if not el.get("name", "").strip():
                        metrics["unnamed_elements"] += 1
            
            for tag, key in [("exclusiveGateway", "exclusive_gw"), ("parallelGateway", "parallel_gw"), ("inclusiveGateway", "inclusive_gw")]:
                found = proc.findall(f".//bpmn:{tag}", ns)
                metrics["gateways"] += len(found)
                metrics[key] += len(found)
            
            metrics["start_events"] += len(proc.findall(".//bpmn:startEvent", ns))
            metrics["end_events"] += len(proc.findall(".//bpmn:endEvent", ns))
            metrics["events"] = metrics["start_events"] + metrics["end_events"]
            
            flows = proc.findall("bpmn:sequenceFlow", ns)
            metrics["flows"] += len(flows)
            
            for flow in flows:
                target = flow.get("targetRef", "")
                source = flow.get("sourceRef", "")
                incoming_count[target] = incoming_count.get(target, 0) + 1
                outgoing_count[source] = outgoing_count.get(source, 0) + 1
        
        for eid, count in incoming_count.items():
            if count >= 3:
                metrics["bottlenecks"].append({"element_id": eid, "incoming_flows": count})
        
        paths = 1
        for _ in range(metrics["exclusive_gw"]):
            paths *= 2
        for _ in range(metrics["inclusive_gw"]):
            paths *= 2
        metrics["estimated_paths"] = paths
        
        cfc = metrics["exclusive_gw"] + metrics["parallel_gw"] * 2 + metrics["inclusive_gw"] * 3
        metrics["complexity_score"] = cfc + metrics["tasks"]
        
        if metrics["complexity_score"] <= 10:
            metrics["complexity_level"] = "simple"
        elif metrics["complexity_score"] <= 25:
            metrics["complexity_level"] = "moderate"
        elif metrics["complexity_score"] <= 50:
            metrics["complexity_level"] = "complex"
        else:
            metrics["complexity_level"] = "very_complex"
    except:
        pass
    
    version_count = await db.versions.count_documents({"diagram_id": diagram_id})
    branch_count = await db.branches.count_documents({"diagram_id": diagram_id, "status": "active"})
    comment_count = await db.comments.count_documents({"diagram_id": diagram_id})
    
    metrics["version_count"] = version_count
    metrics["active_branches"] = branch_count
    metrics["comment_count"] = comment_count
    
    return metrics


# ==================== STATS & TAGS ====================

@router.get("/stats")
async def get_stats(request: Request):
    total_diagrams = await db.diagrams.count_documents({})
    total_versions = await db.versions.count_documents({})
    total_branches = await db.branches.count_documents({"status": "active"})
    total_classes = await db.oop_classes.count_documents({})
    total_components = await db.components.count_documents({})
    total_projects = await db.projects.count_documents({})
    
    recent_versions = await db.versions.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    recent_comments = await db.comments.find({}, {"_id": 0}).sort("created_at", -1).to_list(10)
    
    authors_pipeline = [{"$group": {"_id": "$created_by"}}, {"$count": "count"}]
    authors_result = await db.diagrams.aggregate(authors_pipeline).to_list(1)
    unique_authors = authors_result[0]["count"] if authors_result else 0
    
    return {
        "total_diagrams": total_diagrams,
        "total_versions": total_versions,
        "active_branches": total_branches,
        "total_classes": total_classes,
        "total_components": total_components,
        "total_projects": total_projects,
        "unique_authors": unique_authors,
        "recent_versions": recent_versions,
        "recent_comments": recent_comments
    }


@router.get("/tags")
async def get_all_tags():
    pipeline = [
        {"$unwind": "$tags"},
        {"$group": {"_id": "$tags", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    tags = await db.diagrams.aggregate(pipeline).to_list(100)
    return [{"name": t["_id"], "count": t["count"]} for t in tags]
