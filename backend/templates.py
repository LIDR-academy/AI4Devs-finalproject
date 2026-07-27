# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""Predefined project templates with BPMN diagrams."""

TEMPLATES = [
    {
        "id": "purchase-order",
        "name": "Proceso de Compra",
        "description": "Flujo completo de orden de compra: solicitud, aprobacion, pago y recepcion de mercancia.",
        "icon": "briefcase",
        "color": "#2563EB",
        "tags": ["compras", "aprobacion", "pago"],
        "diagrams": [
            {
                "name": "Flujo Principal - Orden de Compra",
                "description": "Proceso end-to-end desde la solicitud hasta la recepcion.",
                "tags": ["compras", "principal"],
                "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Purchase" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Solicitud recibida" />
    <bpmn:userTask id="Task_Review" name="Revisar solicitud" />
    <bpmn:exclusiveGateway id="GW_Approval" name="Aprobada?" />
    <bpmn:userTask id="Task_Approve" name="Aprobacion gerencial" />
    <bpmn:serviceTask id="Task_Payment" name="Procesar pago" />
    <bpmn:userTask id="Task_Receive" name="Recibir mercancia" />
    <bpmn:userTask id="Task_Reject" name="Notificar rechazo" />
    <bpmn:endEvent id="End_OK" name="Compra completada" />
    <bpmn:endEvent id="End_Reject" name="Solicitud rechazada" />
    <bpmn:sequenceFlow id="F1" sourceRef="Start_1" targetRef="Task_Review" />
    <bpmn:sequenceFlow id="F2" sourceRef="Task_Review" targetRef="Task_Approve" />
    <bpmn:sequenceFlow id="F3" sourceRef="Task_Approve" targetRef="GW_Approval" />
    <bpmn:sequenceFlow id="F4" name="Si" sourceRef="GW_Approval" targetRef="Task_Payment" />
    <bpmn:sequenceFlow id="F5" name="No" sourceRef="GW_Approval" targetRef="Task_Reject" />
    <bpmn:sequenceFlow id="F6" sourceRef="Task_Payment" targetRef="Task_Receive" />
    <bpmn:sequenceFlow id="F7" sourceRef="Task_Receive" targetRef="End_OK" />
    <bpmn:sequenceFlow id="F8" sourceRef="Task_Reject" targetRef="End_Reject" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Purchase">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="179" y="99" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Review_di" bpmnElement="Task_Review"><dc:Bounds x="270" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Approve_di" bpmnElement="Task_Approve"><dc:Bounds x="420" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Approval_di" bpmnElement="GW_Approval" isMarkerVisible="true"><dc:Bounds x="575" y="92" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Payment_di" bpmnElement="Task_Payment"><dc:Bounds x="680" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Receive_di" bpmnElement="Task_Receive"><dc:Bounds x="830" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Reject_di" bpmnElement="Task_Reject"><dc:Bounds x="680" y="200" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_OK_di" bpmnElement="End_OK"><dc:Bounds x="982" y="99" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Reject_di" bpmnElement="End_Reject"><dc:Bounds x="832" y="222" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="215" y="117" /><di:waypoint x="270" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="370" y="117" /><di:waypoint x="420" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="520" y="117" /><di:waypoint x="575" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F4_di" bpmnElement="F4"><di:waypoint x="625" y="117" /><di:waypoint x="680" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F5_di" bpmnElement="F5"><di:waypoint x="600" y="142" /><di:waypoint x="600" y="240" /><di:waypoint x="680" y="240" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F6_di" bpmnElement="F6"><di:waypoint x="780" y="117" /><di:waypoint x="830" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F7_di" bpmnElement="F7"><di:waypoint x="930" y="117" /><di:waypoint x="982" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F8_di" bpmnElement="F8"><di:waypoint x="780" y="240" /><di:waypoint x="832" y="240" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
            }
        ]
    },
    {
        "id": "employee-onboarding",
        "name": "Onboarding de Empleados",
        "description": "Proceso de incorporacion de nuevos empleados: documentacion, accesos IT, capacitacion y seguimiento.",
        "icon": "rocket",
        "color": "#10B981",
        "tags": ["rrhh", "onboarding", "empleados"],
        "diagrams": [
            {
                "name": "Flujo de Onboarding",
                "description": "Proceso completo de incorporacion desde firma de contrato hasta evaluacion.",
                "tags": ["rrhh", "onboarding"],
                "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Onboarding" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Nuevo empleado" />
    <bpmn:userTask id="Task_Docs" name="Firmar documentacion" />
    <bpmn:parallelGateway id="GW_Split" name="Tareas paralelas" />
    <bpmn:serviceTask id="Task_Email" name="Crear cuenta email" />
    <bpmn:serviceTask id="Task_Access" name="Configurar accesos" />
    <bpmn:userTask id="Task_Equipment" name="Entregar equipamiento" />
    <bpmn:parallelGateway id="GW_Join" name="Sincronizar" />
    <bpmn:userTask id="Task_Training" name="Capacitacion inicial" />
    <bpmn:userTask id="Task_Mentor" name="Asignar mentor" />
    <bpmn:userTask id="Task_Eval" name="Evaluacion 30 dias" />
    <bpmn:endEvent id="End_1" name="Onboarding completo" />
    <bpmn:sequenceFlow id="F1" sourceRef="Start_1" targetRef="Task_Docs" />
    <bpmn:sequenceFlow id="F2" sourceRef="Task_Docs" targetRef="GW_Split" />
    <bpmn:sequenceFlow id="F3" sourceRef="GW_Split" targetRef="Task_Email" />
    <bpmn:sequenceFlow id="F4" sourceRef="GW_Split" targetRef="Task_Access" />
    <bpmn:sequenceFlow id="F5" sourceRef="GW_Split" targetRef="Task_Equipment" />
    <bpmn:sequenceFlow id="F6" sourceRef="Task_Email" targetRef="GW_Join" />
    <bpmn:sequenceFlow id="F7" sourceRef="Task_Access" targetRef="GW_Join" />
    <bpmn:sequenceFlow id="F8" sourceRef="Task_Equipment" targetRef="GW_Join" />
    <bpmn:sequenceFlow id="F9" sourceRef="GW_Join" targetRef="Task_Training" />
    <bpmn:sequenceFlow id="F10" sourceRef="Task_Training" targetRef="Task_Mentor" />
    <bpmn:sequenceFlow id="F11" sourceRef="Task_Mentor" targetRef="Task_Eval" />
    <bpmn:sequenceFlow id="F12" sourceRef="Task_Eval" targetRef="End_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Onboarding">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="179" y="159" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Docs_di" bpmnElement="Task_Docs"><dc:Bounds x="270" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Split_di" bpmnElement="GW_Split"><dc:Bounds x="425" y="152" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Email_di" bpmnElement="Task_Email"><dc:Bounds x="530" y="37" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Access_di" bpmnElement="Task_Access"><dc:Bounds x="530" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Equipment_di" bpmnElement="Task_Equipment"><dc:Bounds x="530" y="237" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Join_di" bpmnElement="GW_Join"><dc:Bounds x="685" y="152" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Training_di" bpmnElement="Task_Training"><dc:Bounds x="790" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Mentor_di" bpmnElement="Task_Mentor"><dc:Bounds x="940" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Eval_di" bpmnElement="Task_Eval"><dc:Bounds x="1090" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><dc:Bounds x="1242" y="159" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="215" y="177" /><di:waypoint x="270" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="370" y="177" /><di:waypoint x="425" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="450" y="152" /><di:waypoint x="450" y="77" /><di:waypoint x="530" y="77" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F4_di" bpmnElement="F4"><di:waypoint x="475" y="177" /><di:waypoint x="530" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F5_di" bpmnElement="F5"><di:waypoint x="450" y="202" /><di:waypoint x="450" y="277" /><di:waypoint x="530" y="277" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F6_di" bpmnElement="F6"><di:waypoint x="630" y="77" /><di:waypoint x="710" y="77" /><di:waypoint x="710" y="152" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F7_di" bpmnElement="F7"><di:waypoint x="630" y="177" /><di:waypoint x="685" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F8_di" bpmnElement="F8"><di:waypoint x="630" y="277" /><di:waypoint x="710" y="277" /><di:waypoint x="710" y="202" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F9_di" bpmnElement="F9"><di:waypoint x="735" y="177" /><di:waypoint x="790" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10"><di:waypoint x="890" y="177" /><di:waypoint x="940" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_di" bpmnElement="F11"><di:waypoint x="1040" y="177" /><di:waypoint x="1090" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F12_di" bpmnElement="F12"><di:waypoint x="1190" y="177" /><di:waypoint x="1242" y="177" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
            }
        ]
    },
    {
        "id": "cicd-pipeline",
        "name": "CI/CD Pipeline",
        "description": "Pipeline de integracion y despliegue continuo: commit, build, test, deploy a staging y produccion.",
        "icon": "zap",
        "color": "#F59E0B",
        "tags": ["devops", "ci-cd", "automatizacion"],
        "diagrams": [
            {
                "name": "Pipeline CI/CD",
                "description": "Flujo automatizado de build, test y deploy.",
                "tags": ["devops", "ci-cd"],
                "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_CICD" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Push a repositorio" />
    <bpmn:serviceTask id="Task_Build" name="Build del proyecto" />
    <bpmn:serviceTask id="Task_Lint" name="Lint y analisis estatico" />
    <bpmn:serviceTask id="Task_Test" name="Ejecutar tests" />
    <bpmn:exclusiveGateway id="GW_Tests" name="Tests OK?" />
    <bpmn:serviceTask id="Task_Staging" name="Deploy a Staging" />
    <bpmn:userTask id="Task_QA" name="QA Manual" />
    <bpmn:exclusiveGateway id="GW_QA" name="QA Aprobado?" />
    <bpmn:serviceTask id="Task_Prod" name="Deploy a Produccion" />
    <bpmn:serviceTask id="Task_Notify_Fail" name="Notificar fallo" />
    <bpmn:endEvent id="End_OK" name="Desplegado" />
    <bpmn:endEvent id="End_Fail" name="Pipeline fallido" />
    <bpmn:sequenceFlow id="F1" sourceRef="Start_1" targetRef="Task_Build" />
    <bpmn:sequenceFlow id="F2" sourceRef="Task_Build" targetRef="Task_Lint" />
    <bpmn:sequenceFlow id="F3" sourceRef="Task_Lint" targetRef="Task_Test" />
    <bpmn:sequenceFlow id="F4" sourceRef="Task_Test" targetRef="GW_Tests" />
    <bpmn:sequenceFlow id="F5" name="Si" sourceRef="GW_Tests" targetRef="Task_Staging" />
    <bpmn:sequenceFlow id="F6" name="No" sourceRef="GW_Tests" targetRef="Task_Notify_Fail" />
    <bpmn:sequenceFlow id="F7" sourceRef="Task_Staging" targetRef="Task_QA" />
    <bpmn:sequenceFlow id="F8" sourceRef="Task_QA" targetRef="GW_QA" />
    <bpmn:sequenceFlow id="F9" name="Si" sourceRef="GW_QA" targetRef="Task_Prod" />
    <bpmn:sequenceFlow id="F10" name="No" sourceRef="GW_QA" targetRef="Task_Notify_Fail" />
    <bpmn:sequenceFlow id="F11" sourceRef="Task_Prod" targetRef="End_OK" />
    <bpmn:sequenceFlow id="F12" sourceRef="Task_Notify_Fail" targetRef="End_Fail" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_CICD">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="179" y="99" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Build_di" bpmnElement="Task_Build"><dc:Bounds x="270" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Lint_di" bpmnElement="Task_Lint"><dc:Bounds x="420" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Test_di" bpmnElement="Task_Test"><dc:Bounds x="570" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Tests_di" bpmnElement="GW_Tests" isMarkerVisible="true"><dc:Bounds x="725" y="92" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Staging_di" bpmnElement="Task_Staging"><dc:Bounds x="830" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_QA_di" bpmnElement="Task_QA"><dc:Bounds x="980" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_QA_di" bpmnElement="GW_QA" isMarkerVisible="true"><dc:Bounds x="1135" y="92" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Prod_di" bpmnElement="Task_Prod"><dc:Bounds x="1240" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Notify_Fail_di" bpmnElement="Task_Notify_Fail"><dc:Bounds x="830" y="220" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_OK_di" bpmnElement="End_OK"><dc:Bounds x="1392" y="99" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Fail_di" bpmnElement="End_Fail"><dc:Bounds x="982" y="242" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="215" y="117" /><di:waypoint x="270" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="370" y="117" /><di:waypoint x="420" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="520" y="117" /><di:waypoint x="570" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F4_di" bpmnElement="F4"><di:waypoint x="670" y="117" /><di:waypoint x="725" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F5_di" bpmnElement="F5"><di:waypoint x="775" y="117" /><di:waypoint x="830" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F6_di" bpmnElement="F6"><di:waypoint x="750" y="142" /><di:waypoint x="750" y="260" /><di:waypoint x="830" y="260" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F7_di" bpmnElement="F7"><di:waypoint x="930" y="117" /><di:waypoint x="980" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F8_di" bpmnElement="F8"><di:waypoint x="1080" y="117" /><di:waypoint x="1135" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F9_di" bpmnElement="F9"><di:waypoint x="1185" y="117" /><di:waypoint x="1240" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10"><di:waypoint x="1160" y="142" /><di:waypoint x="1160" y="260" /><di:waypoint x="930" y="260" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_di" bpmnElement="F11"><di:waypoint x="1340" y="117" /><di:waypoint x="1392" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F12_di" bpmnElement="F12"><di:waypoint x="930" y="260" /><di:waypoint x="982" y="260" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
            }
        ]
    },
    {
        "id": "customer-support",
        "name": "Atencion al Cliente",
        "description": "Flujo de soporte al cliente: recepcion de ticket, clasificacion, resolucion y seguimiento.",
        "icon": "target",
        "color": "#8B5CF6",
        "tags": ["soporte", "cliente", "tickets"],
        "diagrams": [
            {
                "name": "Flujo de Soporte",
                "description": "Gestion de tickets desde la recepcion hasta el cierre.",
                "tags": ["soporte", "tickets"],
                "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Support" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Ticket recibido" />
    <bpmn:serviceTask id="Task_Classify" name="Clasificar prioridad" />
    <bpmn:exclusiveGateway id="GW_Priority" name="Prioridad?" />
    <bpmn:userTask id="Task_L1" name="Soporte Nivel 1" />
    <bpmn:userTask id="Task_L2" name="Soporte Nivel 2" />
    <bpmn:userTask id="Task_Escalate" name="Escalar a ingenieria" />
    <bpmn:exclusiveGateway id="GW_Resolved" name="Resuelto?" />
    <bpmn:userTask id="Task_Confirm" name="Confirmar con cliente" />
    <bpmn:serviceTask id="Task_Close" name="Cerrar ticket" />
    <bpmn:endEvent id="End_1" name="Caso cerrado" />
    <bpmn:sequenceFlow id="F1" sourceRef="Start_1" targetRef="Task_Classify" />
    <bpmn:sequenceFlow id="F2" sourceRef="Task_Classify" targetRef="GW_Priority" />
    <bpmn:sequenceFlow id="F3" name="Baja" sourceRef="GW_Priority" targetRef="Task_L1" />
    <bpmn:sequenceFlow id="F4" name="Media" sourceRef="GW_Priority" targetRef="Task_L2" />
    <bpmn:sequenceFlow id="F5" name="Alta" sourceRef="GW_Priority" targetRef="Task_Escalate" />
    <bpmn:sequenceFlow id="F6" sourceRef="Task_L1" targetRef="GW_Resolved" />
    <bpmn:sequenceFlow id="F7" sourceRef="Task_L2" targetRef="GW_Resolved" />
    <bpmn:sequenceFlow id="F8" sourceRef="Task_Escalate" targetRef="GW_Resolved" />
    <bpmn:sequenceFlow id="F9" name="Si" sourceRef="GW_Resolved" targetRef="Task_Confirm" />
    <bpmn:sequenceFlow id="F10" name="No" sourceRef="GW_Resolved" targetRef="Task_Escalate" />
    <bpmn:sequenceFlow id="F11" sourceRef="Task_Confirm" targetRef="Task_Close" />
    <bpmn:sequenceFlow id="F12" sourceRef="Task_Close" targetRef="End_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_Support">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="179" y="159" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Classify_di" bpmnElement="Task_Classify"><dc:Bounds x="270" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Priority_di" bpmnElement="GW_Priority" isMarkerVisible="true"><dc:Bounds x="425" y="152" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_L1_di" bpmnElement="Task_L1"><dc:Bounds x="530" y="37" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_L2_di" bpmnElement="Task_L2"><dc:Bounds x="530" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Escalate_di" bpmnElement="Task_Escalate"><dc:Bounds x="530" y="257" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Resolved_di" bpmnElement="GW_Resolved" isMarkerVisible="true"><dc:Bounds x="695" y="152" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Confirm_di" bpmnElement="Task_Confirm"><dc:Bounds x="810" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Close_di" bpmnElement="Task_Close"><dc:Bounds x="960" y="137" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><dc:Bounds x="1112" y="159" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="215" y="177" /><di:waypoint x="270" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="370" y="177" /><di:waypoint x="425" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="450" y="152" /><di:waypoint x="450" y="77" /><di:waypoint x="530" y="77" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F4_di" bpmnElement="F4"><di:waypoint x="475" y="177" /><di:waypoint x="530" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F5_di" bpmnElement="F5"><di:waypoint x="450" y="202" /><di:waypoint x="450" y="297" /><di:waypoint x="530" y="297" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F6_di" bpmnElement="F6"><di:waypoint x="630" y="77" /><di:waypoint x="720" y="77" /><di:waypoint x="720" y="152" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F7_di" bpmnElement="F7"><di:waypoint x="630" y="177" /><di:waypoint x="695" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F8_di" bpmnElement="F8"><di:waypoint x="630" y="297" /><di:waypoint x="720" y="297" /><di:waypoint x="720" y="202" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F9_di" bpmnElement="F9"><di:waypoint x="745" y="177" /><di:waypoint x="810" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10"><di:waypoint x="720" y="202" /><di:waypoint x="720" y="340" /><di:waypoint x="580" y="340" /><di:waypoint x="580" y="337" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_di" bpmnElement="F11"><di:waypoint x="910" y="177" /><di:waypoint x="960" y="177" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F12_di" bpmnElement="F12"><di:waypoint x="1060" y="177" /><di:waypoint x="1112" y="177" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
            }
        ]
    },
    {
        "id": "document-approval",
        "name": "Aprobacion de Documentos",
        "description": "Workflow de creacion, revision y aprobacion de documentos con multiples revisores.",
        "icon": "layers",
        "color": "#EF4444",
        "tags": ["documentos", "aprobacion", "revision"],
        "diagrams": [
            {
                "name": "Flujo de Aprobacion",
                "description": "Proceso de revision y aprobacion documental multi-nivel.",
                "tags": ["documentos", "aprobacion"],
                "xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_DocApproval" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Documento creado" />
    <bpmn:userTask id="Task_Draft" name="Redactar documento" />
    <bpmn:userTask id="Task_Rev1" name="Revision tecnica" />
    <bpmn:exclusiveGateway id="GW_Rev1" name="Aprobado?" />
    <bpmn:userTask id="Task_Fix" name="Corregir observaciones" />
    <bpmn:userTask id="Task_Rev2" name="Revision gerencial" />
    <bpmn:exclusiveGateway id="GW_Rev2" name="Aprobado?" />
    <bpmn:serviceTask id="Task_Publish" name="Publicar documento" />
    <bpmn:serviceTask id="Task_Notify" name="Notificar interesados" />
    <bpmn:endEvent id="End_1" name="Documento publicado" />
    <bpmn:sequenceFlow id="F1" sourceRef="Start_1" targetRef="Task_Draft" />
    <bpmn:sequenceFlow id="F2" sourceRef="Task_Draft" targetRef="Task_Rev1" />
    <bpmn:sequenceFlow id="F3" sourceRef="Task_Rev1" targetRef="GW_Rev1" />
    <bpmn:sequenceFlow id="F4" name="Si" sourceRef="GW_Rev1" targetRef="Task_Rev2" />
    <bpmn:sequenceFlow id="F5" name="No" sourceRef="GW_Rev1" targetRef="Task_Fix" />
    <bpmn:sequenceFlow id="F6" sourceRef="Task_Fix" targetRef="Task_Rev1" />
    <bpmn:sequenceFlow id="F7" sourceRef="Task_Rev2" targetRef="GW_Rev2" />
    <bpmn:sequenceFlow id="F8" name="Si" sourceRef="GW_Rev2" targetRef="Task_Publish" />
    <bpmn:sequenceFlow id="F9" name="No" sourceRef="GW_Rev2" targetRef="Task_Fix" />
    <bpmn:sequenceFlow id="F10" sourceRef="Task_Publish" targetRef="Task_Notify" />
    <bpmn:sequenceFlow id="F11" sourceRef="Task_Notify" targetRef="End_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_DocApproval">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="179" y="99" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Draft_di" bpmnElement="Task_Draft"><dc:Bounds x="270" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Rev1_di" bpmnElement="Task_Rev1"><dc:Bounds x="420" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Rev1_di" bpmnElement="GW_Rev1" isMarkerVisible="true"><dc:Bounds x="575" y="92" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Fix_di" bpmnElement="Task_Fix"><dc:Bounds x="420" y="220" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Rev2_di" bpmnElement="Task_Rev2"><dc:Bounds x="680" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Rev2_di" bpmnElement="GW_Rev2" isMarkerVisible="true"><dc:Bounds x="835" y="92" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Publish_di" bpmnElement="Task_Publish"><dc:Bounds x="940" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Notify_di" bpmnElement="Task_Notify"><dc:Bounds x="1090" y="77" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_1_di" bpmnElement="End_1"><dc:Bounds x="1242" y="99" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="F1_di" bpmnElement="F1"><di:waypoint x="215" y="117" /><di:waypoint x="270" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F2_di" bpmnElement="F2"><di:waypoint x="370" y="117" /><di:waypoint x="420" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F3_di" bpmnElement="F3"><di:waypoint x="520" y="117" /><di:waypoint x="575" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F4_di" bpmnElement="F4"><di:waypoint x="625" y="117" /><di:waypoint x="680" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F5_di" bpmnElement="F5"><di:waypoint x="600" y="142" /><di:waypoint x="600" y="260" /><di:waypoint x="520" y="260" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F6_di" bpmnElement="F6"><di:waypoint x="470" y="220" /><di:waypoint x="470" y="157" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F7_di" bpmnElement="F7"><di:waypoint x="780" y="117" /><di:waypoint x="835" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F8_di" bpmnElement="F8"><di:waypoint x="885" y="117" /><di:waypoint x="940" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F9_di" bpmnElement="F9"><di:waypoint x="860" y="142" /><di:waypoint x="860" y="260" /><di:waypoint x="520" y="260" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10"><di:waypoint x="1040" y="117" /><di:waypoint x="1090" y="117" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_di" bpmnElement="F11"><di:waypoint x="1190" y="117" /><di:waypoint x="1242" y="117" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""
            }
        ]
    },
]
