# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

# Seed data for initial projects and diagrams
# Auto-generated - contains BPMN XML for LTI project

FLUJO_PRINCIPAL_XML = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_AddCandidate" name="Añadir Nuevo Candidato" isExecutable="true">
    <bpmn:startEvent id="Start_1" name="Reclutador accede al Dashboard">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:userTask id="Task_ClickAdd" name="Clic en Añadir Candidato">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_FillRequired" name="Completar campos obligatorios (Nombre, Apellido, Email, Telefono)">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_FillOptional" name="Completar campos opcionales (Direccion, Educacion, Experiencia)">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Task_UploadCV" name="Cargar CV (PDF/DOC/DOCX, max 5MB)">
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_ValidateClient" name="Validacion client-side (email, campos obligatorios)">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="GW_ValidClient" name="Validacion OK?">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:outgoing>Flow_7_Yes</bpmn:outgoing>
      <bpmn:outgoing>Flow_7_No</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_ShowErrors" name="Mostrar errores de validacion">
      <bpmn:incoming>Flow_7_No</bpmn:incoming>
      <bpmn:outgoing>Flow_BackToForm</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_SendAPI" name="Enviar POST /candidates al Backend">
      <bpmn:incoming>Flow_7_Yes</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_ServerValidate" name="Validacion server-side y sanitizacion">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_CheckDuplicate" name="Verificar email duplicado en BD">
      <bpmn:incoming>Flow_9</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="GW_Duplicate" name="Email ya existe?">
      <bpmn:incoming>Flow_10</bpmn:incoming>
      <bpmn:outgoing>Flow_11_New</bpmn:outgoing>
      <bpmn:outgoing>Flow_11_Dup</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_ErrorDuplicate" name="Retornar error: El correo ya existe">
      <bpmn:incoming>Flow_11_Dup</bpmn:incoming>
      <bpmn:outgoing>Flow_ToDupEnd</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_UploadStorage" name="Almacenar CV en Cloud Storage">
      <bpmn:incoming>Flow_11_New</bpmn:incoming>
      <bpmn:outgoing>Flow_12</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_SaveDB" name="Guardar candidato en Base de Datos">
      <bpmn:incoming>Flow_12</bpmn:incoming>
      <bpmn:outgoing>Flow_13</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_ShowSuccess" name="Toast: Candidato registrado correctamente">
      <bpmn:incoming>Flow_13</bpmn:incoming>
      <bpmn:outgoing>Flow_14</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="End_Success" name="Candidato Registrado">
      <bpmn:incoming>Flow_14</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:endEvent id="End_Duplicate" name="Registro Rechazado (Duplicado)">
      <bpmn:incoming>Flow_ToDupEnd</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_ClickAdd" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_ClickAdd" targetRef="Task_FillRequired" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_FillRequired" targetRef="Task_FillOptional" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Task_FillOptional" targetRef="Task_UploadCV" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_UploadCV" targetRef="Task_ValidateClient" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_ValidateClient" targetRef="GW_ValidClient" />
    <bpmn:sequenceFlow id="Flow_7_Yes" name="Si" sourceRef="GW_ValidClient" targetRef="Task_SendAPI" />
    <bpmn:sequenceFlow id="Flow_7_No" name="No" sourceRef="GW_ValidClient" targetRef="Task_ShowErrors" />
    <bpmn:sequenceFlow id="Flow_BackToForm" sourceRef="Task_ShowErrors" targetRef="Task_FillRequired" />
    <bpmn:sequenceFlow id="Flow_8" sourceRef="Task_SendAPI" targetRef="Task_ServerValidate" />
    <bpmn:sequenceFlow id="Flow_9" sourceRef="Task_ServerValidate" targetRef="Task_CheckDuplicate" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_CheckDuplicate" targetRef="GW_Duplicate" />
    <bpmn:sequenceFlow id="Flow_11_New" name="No existe" sourceRef="GW_Duplicate" targetRef="Task_UploadStorage" />
    <bpmn:sequenceFlow id="Flow_11_Dup" name="Ya existe" sourceRef="GW_Duplicate" targetRef="Task_ErrorDuplicate" />
    <bpmn:sequenceFlow id="Flow_ToDupEnd" sourceRef="Task_ErrorDuplicate" targetRef="End_Duplicate" />
    <bpmn:sequenceFlow id="Flow_12" sourceRef="Task_UploadStorage" targetRef="Task_SaveDB" />
    <bpmn:sequenceFlow id="Flow_13" sourceRef="Task_SaveDB" targetRef="Task_ShowSuccess" />
    <bpmn:sequenceFlow id="Flow_14" sourceRef="Task_ShowSuccess" targetRef="End_Success" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_AddCandidate">
      <bpmndi:BPMNShape id="Start_1_di" bpmnElement="Start_1"><dc:Bounds x="152" y="232" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClickAdd_di" bpmnElement="Task_ClickAdd"><dc:Bounds x="240" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FillRequired_di" bpmnElement="Task_FillRequired"><dc:Bounds x="390" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FillOptional_di" bpmnElement="Task_FillOptional"><dc:Bounds x="540" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_UploadCV_di" bpmnElement="Task_UploadCV"><dc:Bounds x="690" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ValidateClient_di" bpmnElement="Task_ValidateClient"><dc:Bounds x="840" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_ValidClient_di" bpmnElement="GW_ValidClient" isMarkerVisible="true"><dc:Bounds x="985" y="225" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ShowErrors_di" bpmnElement="Task_ShowErrors"><dc:Bounds x="960" y="340" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SendAPI_di" bpmnElement="Task_SendAPI"><dc:Bounds x="1090" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ServerValidate_di" bpmnElement="Task_ServerValidate"><dc:Bounds x="1240" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CheckDuplicate_di" bpmnElement="Task_CheckDuplicate"><dc:Bounds x="1390" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="GW_Duplicate_di" bpmnElement="GW_Duplicate" isMarkerVisible="true"><dc:Bounds x="1535" y="225" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ErrorDuplicate_di" bpmnElement="Task_ErrorDuplicate"><dc:Bounds x="1510" y="340" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_UploadStorage_di" bpmnElement="Task_UploadStorage"><dc:Bounds x="1640" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SaveDB_di" bpmnElement="Task_SaveDB"><dc:Bounds x="1790" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ShowSuccess_di" bpmnElement="Task_ShowSuccess"><dc:Bounds x="1940" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Success_di" bpmnElement="End_Success"><dc:Bounds x="2092" y="232" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Duplicate_di" bpmnElement="End_Duplicate"><dc:Bounds x="1662" y="362" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1"><di:waypoint x="188" y="250" /><di:waypoint x="240" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2"><di:waypoint x="340" y="250" /><di:waypoint x="390" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3"><di:waypoint x="490" y="250" /><di:waypoint x="540" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4"><di:waypoint x="640" y="250" /><di:waypoint x="690" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5"><di:waypoint x="790" y="250" /><di:waypoint x="840" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6"><di:waypoint x="940" y="250" /><di:waypoint x="985" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_Yes_di" bpmnElement="Flow_7_Yes"><di:waypoint x="1035" y="250" /><di:waypoint x="1090" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_No_di" bpmnElement="Flow_7_No"><di:waypoint x="1010" y="275" /><di:waypoint x="1010" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_BackToForm_di" bpmnElement="Flow_BackToForm"><di:waypoint x="960" y="380" /><di:waypoint x="440" y="380" /><di:waypoint x="440" y="290" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8"><di:waypoint x="1190" y="250" /><di:waypoint x="1240" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9"><di:waypoint x="1340" y="250" /><di:waypoint x="1390" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10"><di:waypoint x="1490" y="250" /><di:waypoint x="1535" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11_New_di" bpmnElement="Flow_11_New"><di:waypoint x="1585" y="250" /><di:waypoint x="1640" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11_Dup_di" bpmnElement="Flow_11_Dup"><di:waypoint x="1560" y="275" /><di:waypoint x="1560" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_ToDupEnd_di" bpmnElement="Flow_ToDupEnd"><di:waypoint x="1610" y="380" /><di:waypoint x="1662" y="380" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_12_di" bpmnElement="Flow_12"><di:waypoint x="1740" y="250" /><di:waypoint x="1790" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_13_di" bpmnElement="Flow_13"><di:waypoint x="1890" y="250" /><di:waypoint x="1940" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_14_di" bpmnElement="Flow_14"><di:waypoint x="2040" y="250" /><di:waypoint x="2092" y="250" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""

FRONTEND_XML = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_FE" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Frontend" name="Frontend - Formulario Candidato" isExecutable="true">
    <bpmn:startEvent id="FE_Start" name="Usuario abre formulario">
      <bpmn:outgoing>FE_F1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="FE_CheckRole" name="Verificar rol (Recruiter/Admin)">
      <bpmn:incoming>FE_F1</bpmn:incoming>
      <bpmn:outgoing>FE_F2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="FE_GW_Role" name="Tiene permisos?">
      <bpmn:incoming>FE_F2</bpmn:incoming>
      <bpmn:outgoing>FE_F3_Yes</bpmn:outgoing>
      <bpmn:outgoing>FE_F3_No</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="FE_End_NoAccess" name="Acceso denegado">
      <bpmn:incoming>FE_F3_No</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:userTask id="FE_RenderForm" name="Renderizar formulario responsive (Mobile/Desktop)">
      <bpmn:incoming>FE_F3_Yes</bpmn:incoming>
      <bpmn:outgoing>FE_F4</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:parallelGateway id="FE_GW_Parallel" name="Campos en paralelo">
      <bpmn:incoming>FE_F4</bpmn:incoming>
      <bpmn:outgoing>FE_P1</bpmn:outgoing>
      <bpmn:outgoing>FE_P2</bpmn:outgoing>
      <bpmn:outgoing>FE_P3</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:userTask id="FE_RequiredFields" name="Inputs obligatorios: Nombre*, Apellido*, Email* (regex), Telefono* (mascara)">
      <bpmn:incoming>FE_P1</bpmn:incoming>
      <bpmn:outgoing>FE_JP1</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="FE_OptionalFields" name="Inputs opcionales: Direccion, Educacion (Typeahead), Experiencia (Typeahead)">
      <bpmn:incoming>FE_P2</bpmn:incoming>
      <bpmn:outgoing>FE_JP2</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="FE_FileUpload" name="Drag-and-Drop CV (.pdf .doc .docx max 5MB) con previsualizacion">
      <bpmn:incoming>FE_P3</bpmn:incoming>
      <bpmn:outgoing>FE_JP3</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:parallelGateway id="FE_GW_Join" name="Unir campos">
      <bpmn:incoming>FE_JP1</bpmn:incoming>
      <bpmn:incoming>FE_JP2</bpmn:incoming>
      <bpmn:incoming>FE_JP3</bpmn:incoming>
      <bpmn:outgoing>FE_F5</bpmn:outgoing>
    </bpmn:parallelGateway>
    <bpmn:serviceTask id="FE_ValidateAll" name="Validacion real-time (email regex, campos requeridos, tamaño archivo)">
      <bpmn:incoming>FE_F5</bpmn:incoming>
      <bpmn:outgoing>FE_F6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="FE_GW_Valid" name="Formulario valido?">
      <bpmn:incoming>FE_F6</bpmn:incoming>
      <bpmn:outgoing>FE_F7_Ok</bpmn:outgoing>
      <bpmn:outgoing>FE_F7_Err</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="FE_ShowInline" name="Mostrar errores inline bajo cada campo">
      <bpmn:incoming>FE_F7_Err</bpmn:incoming>
      <bpmn:outgoing>FE_BackToForm</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="FE_SetLoading" name="Activar loading state y deshabilitar boton">
      <bpmn:incoming>FE_F7_Ok</bpmn:incoming>
      <bpmn:outgoing>FE_F8</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="FE_PostAPI" name="POST /candidates (FormData con archivo)">
      <bpmn:incoming>FE_F8</bpmn:incoming>
      <bpmn:outgoing>FE_F9</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="FE_GW_Response" name="Respuesta API?">
      <bpmn:incoming>FE_F9</bpmn:incoming>
      <bpmn:outgoing>FE_F10_201</bpmn:outgoing>
      <bpmn:outgoing>FE_F10_409</bpmn:outgoing>
      <bpmn:outgoing>FE_F10_500</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:serviceTask id="FE_Toast201" name="Toast exito: Candidato registrado correctamente">
      <bpmn:incoming>FE_F10_201</bpmn:incoming>
      <bpmn:outgoing>FE_F11</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="FE_Toast409" name="Toast error: El correo ya existe">
      <bpmn:incoming>FE_F10_409</bpmn:incoming>
      <bpmn:outgoing>FE_BackTo409</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="FE_Toast500" name="Toast error: Error de conexion">
      <bpmn:incoming>FE_F10_500</bpmn:incoming>
      <bpmn:outgoing>FE_BackTo500</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="FE_End_Success" name="Redirigir a lista de candidatos">
      <bpmn:incoming>FE_F11</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="FE_F1" sourceRef="FE_Start" targetRef="FE_CheckRole" />
    <bpmn:sequenceFlow id="FE_F2" sourceRef="FE_CheckRole" targetRef="FE_GW_Role" />
    <bpmn:sequenceFlow id="FE_F3_Yes" name="Si" sourceRef="FE_GW_Role" targetRef="FE_RenderForm" />
    <bpmn:sequenceFlow id="FE_F3_No" name="No" sourceRef="FE_GW_Role" targetRef="FE_End_NoAccess" />
    <bpmn:sequenceFlow id="FE_F4" sourceRef="FE_RenderForm" targetRef="FE_GW_Parallel" />
    <bpmn:sequenceFlow id="FE_P1" sourceRef="FE_GW_Parallel" targetRef="FE_RequiredFields" />
    <bpmn:sequenceFlow id="FE_P2" sourceRef="FE_GW_Parallel" targetRef="FE_OptionalFields" />
    <bpmn:sequenceFlow id="FE_P3" sourceRef="FE_GW_Parallel" targetRef="FE_FileUpload" />
    <bpmn:sequenceFlow id="FE_JP1" sourceRef="FE_RequiredFields" targetRef="FE_GW_Join" />
    <bpmn:sequenceFlow id="FE_JP2" sourceRef="FE_OptionalFields" targetRef="FE_GW_Join" />
    <bpmn:sequenceFlow id="FE_JP3" sourceRef="FE_FileUpload" targetRef="FE_GW_Join" />
    <bpmn:sequenceFlow id="FE_F5" sourceRef="FE_GW_Join" targetRef="FE_ValidateAll" />
    <bpmn:sequenceFlow id="FE_F6" sourceRef="FE_ValidateAll" targetRef="FE_GW_Valid" />
    <bpmn:sequenceFlow id="FE_F7_Ok" name="Valido" sourceRef="FE_GW_Valid" targetRef="FE_SetLoading" />
    <bpmn:sequenceFlow id="FE_F7_Err" name="Invalido" sourceRef="FE_GW_Valid" targetRef="FE_ShowInline" />
    <bpmn:sequenceFlow id="FE_BackToForm" sourceRef="FE_ShowInline" targetRef="FE_RenderForm" />
    <bpmn:sequenceFlow id="FE_F8" sourceRef="FE_SetLoading" targetRef="FE_PostAPI" />
    <bpmn:sequenceFlow id="FE_F9" sourceRef="FE_PostAPI" targetRef="FE_GW_Response" />
    <bpmn:sequenceFlow id="FE_F10_201" name="201 Created" sourceRef="FE_GW_Response" targetRef="FE_Toast201" />
    <bpmn:sequenceFlow id="FE_F10_409" name="409 Conflict" sourceRef="FE_GW_Response" targetRef="FE_Toast409" />
    <bpmn:sequenceFlow id="FE_F10_500" name="500 Error" sourceRef="FE_GW_Response" targetRef="FE_Toast500" />
    <bpmn:sequenceFlow id="FE_F11" sourceRef="FE_Toast201" targetRef="FE_End_Success" />
    <bpmn:sequenceFlow id="FE_BackTo409" sourceRef="FE_Toast409" targetRef="FE_RenderForm" />
    <bpmn:sequenceFlow id="FE_BackTo500" sourceRef="FE_Toast500" targetRef="FE_RenderForm" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_FE">
    <bpmndi:BPMNPlane id="BPMNPlane_FE" bpmnElement="Process_Frontend">
      <bpmndi:BPMNShape id="FE_Start_di" bpmnElement="FE_Start"><dc:Bounds x="152" y="282" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_CheckRole_di" bpmnElement="FE_CheckRole"><dc:Bounds x="240" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_GW_Role_di" bpmnElement="FE_GW_Role" isMarkerVisible="true"><dc:Bounds x="385" y="275" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_End_NoAccess_di" bpmnElement="FE_End_NoAccess"><dc:Bounds x="392" y="412" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_RenderForm_di" bpmnElement="FE_RenderForm"><dc:Bounds x="490" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_GW_Parallel_di" bpmnElement="FE_GW_Parallel"><dc:Bounds x="635" y="275" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_RequiredFields_di" bpmnElement="FE_RequiredFields"><dc:Bounds x="730" y="160" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_OptionalFields_di" bpmnElement="FE_OptionalFields"><dc:Bounds x="730" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_FileUpload_di" bpmnElement="FE_FileUpload"><dc:Bounds x="730" y="360" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_GW_Join_di" bpmnElement="FE_GW_Join"><dc:Bounds x="875" y="275" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_ValidateAll_di" bpmnElement="FE_ValidateAll"><dc:Bounds x="970" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_GW_Valid_di" bpmnElement="FE_GW_Valid" isMarkerVisible="true"><dc:Bounds x="1115" y="275" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_ShowInline_di" bpmnElement="FE_ShowInline"><dc:Bounds x="1090" y="410" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_SetLoading_di" bpmnElement="FE_SetLoading"><dc:Bounds x="1220" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_PostAPI_di" bpmnElement="FE_PostAPI"><dc:Bounds x="1370" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_GW_Response_di" bpmnElement="FE_GW_Response" isMarkerVisible="true"><dc:Bounds x="1515" y="275" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_Toast201_di" bpmnElement="FE_Toast201"><dc:Bounds x="1610" y="160" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_Toast409_di" bpmnElement="FE_Toast409"><dc:Bounds x="1610" y="260" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_Toast500_di" bpmnElement="FE_Toast500"><dc:Bounds x="1610" y="360" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="FE_End_Success_di" bpmnElement="FE_End_Success"><dc:Bounds x="1762" y="182" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="FE_F1_di" bpmnElement="FE_F1"><di:waypoint x="188" y="300" /><di:waypoint x="240" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F2_di" bpmnElement="FE_F2"><di:waypoint x="340" y="300" /><di:waypoint x="385" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F3_Yes_di" bpmnElement="FE_F3_Yes"><di:waypoint x="435" y="300" /><di:waypoint x="490" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F3_No_di" bpmnElement="FE_F3_No"><di:waypoint x="410" y="325" /><di:waypoint x="410" y="412" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F4_di" bpmnElement="FE_F4"><di:waypoint x="590" y="300" /><di:waypoint x="635" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_P1_di" bpmnElement="FE_P1"><di:waypoint x="660" y="275" /><di:waypoint x="660" y="200" /><di:waypoint x="730" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_P2_di" bpmnElement="FE_P2"><di:waypoint x="685" y="300" /><di:waypoint x="730" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_P3_di" bpmnElement="FE_P3"><di:waypoint x="660" y="325" /><di:waypoint x="660" y="400" /><di:waypoint x="730" y="400" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_JP1_di" bpmnElement="FE_JP1"><di:waypoint x="830" y="200" /><di:waypoint x="900" y="200" /><di:waypoint x="900" y="275" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_JP2_di" bpmnElement="FE_JP2"><di:waypoint x="830" y="300" /><di:waypoint x="875" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_JP3_di" bpmnElement="FE_JP3"><di:waypoint x="830" y="400" /><di:waypoint x="900" y="400" /><di:waypoint x="900" y="325" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F5_di" bpmnElement="FE_F5"><di:waypoint x="925" y="300" /><di:waypoint x="970" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F6_di" bpmnElement="FE_F6"><di:waypoint x="1070" y="300" /><di:waypoint x="1115" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F7_Ok_di" bpmnElement="FE_F7_Ok"><di:waypoint x="1165" y="300" /><di:waypoint x="1220" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F7_Err_di" bpmnElement="FE_F7_Err"><di:waypoint x="1140" y="325" /><di:waypoint x="1140" y="410" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_BackToForm_di" bpmnElement="FE_BackToForm"><di:waypoint x="1090" y="450" /><di:waypoint x="540" y="450" /><di:waypoint x="540" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F8_di" bpmnElement="FE_F8"><di:waypoint x="1320" y="300" /><di:waypoint x="1370" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F9_di" bpmnElement="FE_F9"><di:waypoint x="1470" y="300" /><di:waypoint x="1515" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F10_201_di" bpmnElement="FE_F10_201"><di:waypoint x="1540" y="275" /><di:waypoint x="1540" y="200" /><di:waypoint x="1610" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F10_409_di" bpmnElement="FE_F10_409"><di:waypoint x="1565" y="300" /><di:waypoint x="1610" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F10_500_di" bpmnElement="FE_F10_500"><di:waypoint x="1540" y="325" /><di:waypoint x="1540" y="400" /><di:waypoint x="1610" y="400" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_F11_di" bpmnElement="FE_F11"><di:waypoint x="1710" y="200" /><di:waypoint x="1762" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_BackTo409_di" bpmnElement="FE_BackTo409"><di:waypoint x="1660" y="340" /><di:waypoint x="1660" y="500" /><di:waypoint x="540" y="500" /><di:waypoint x="540" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FE_BackTo500_di" bpmnElement="FE_BackTo500"><di:waypoint x="1660" y="440" /><di:waypoint x="1660" y="530" /><di:waypoint x="540" y="530" /><di:waypoint x="540" y="340" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""

BACKEND_XML = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_BE" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_Backend" name="Backend - POST /candidates" isExecutable="true">
    <bpmn:startEvent id="BE_Start" name="Request POST /candidates recibido">
      <bpmn:outgoing>BE_F1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:serviceTask id="BE_AuthMiddleware" name="Middleware: Verificar JWT token valido">
      <bpmn:incoming>BE_F1</bpmn:incoming>
      <bpmn:outgoing>BE_F2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="BE_GW_Auth" name="Token valido?">
      <bpmn:incoming>BE_F2</bpmn:incoming>
      <bpmn:outgoing>BE_F3_Yes</bpmn:outgoing>
      <bpmn:outgoing>BE_F3_No</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="BE_End_401" name="401 Unauthorized">
      <bpmn:incoming>BE_F3_No</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="BE_CheckRole" name="Verificar rol usuario (Recruiter o Admin)">
      <bpmn:incoming>BE_F3_Yes</bpmn:incoming>
      <bpmn:outgoing>BE_F4</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="BE_GW_Role" name="Rol autorizado?">
      <bpmn:incoming>BE_F4</bpmn:incoming>
      <bpmn:outgoing>BE_F5_Yes</bpmn:outgoing>
      <bpmn:outgoing>BE_F5_No</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="BE_End_403" name="403 Forbidden">
      <bpmn:incoming>BE_F5_No</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="BE_Sanitize" name="Sanitizar inputs (prevenir XSS, SQL Injection)">
      <bpmn:incoming>BE_F5_Yes</bpmn:incoming>
      <bpmn:outgoing>BE_F6</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="BE_ValidateServer" name="Validar campos server-side (email regex, campos requeridos, formato telefono)">
      <bpmn:incoming>BE_F6</bpmn:incoming>
      <bpmn:outgoing>BE_F7</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="BE_GW_Valid" name="Datos validos?">
      <bpmn:incoming>BE_F7</bpmn:incoming>
      <bpmn:outgoing>BE_F8_Yes</bpmn:outgoing>
      <bpmn:outgoing>BE_F8_No</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="BE_End_422" name="422 Validation Error">
      <bpmn:incoming>BE_F8_No</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="BE_CheckDuplicate" name="Query BD: SELECT WHERE email = input_email">
      <bpmn:incoming>BE_F8_Yes</bpmn:incoming>
      <bpmn:outgoing>BE_F9</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="BE_GW_Dup" name="Email existe?">
      <bpmn:incoming>BE_F9</bpmn:incoming>
      <bpmn:outgoing>BE_F10_New</bpmn:outgoing>
      <bpmn:outgoing>BE_F10_Dup</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:endEvent id="BE_End_409" name="409 Conflict: Email ya existe">
      <bpmn:incoming>BE_F10_Dup</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="BE_ValidateFile" name="Validar archivo CV (tipo, tamaño max 5MB)">
      <bpmn:incoming>BE_F10_New</bpmn:incoming>
      <bpmn:outgoing>BE_F11</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="BE_UploadCloud" name="Subir CV a Cloud Storage (S3/GCS)">
      <bpmn:incoming>BE_F11</bpmn:incoming>
      <bpmn:outgoing>BE_F12</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="BE_SaveDB" name="INSERT candidato en BD (datos + URL del CV)">
      <bpmn:incoming>BE_F12</bpmn:incoming>
      <bpmn:outgoing>BE_F13</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="BE_AuditLog" name="Registrar en audit log (quien, cuando, que)">
      <bpmn:incoming>BE_F13</bpmn:incoming>
      <bpmn:outgoing>BE_F14</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="BE_End_201" name="201 Created + JSON candidato">
      <bpmn:incoming>BE_F14</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="BE_F1" sourceRef="BE_Start" targetRef="BE_AuthMiddleware" />
    <bpmn:sequenceFlow id="BE_F2" sourceRef="BE_AuthMiddleware" targetRef="BE_GW_Auth" />
    <bpmn:sequenceFlow id="BE_F3_Yes" name="Si" sourceRef="BE_GW_Auth" targetRef="BE_CheckRole" />
    <bpmn:sequenceFlow id="BE_F3_No" name="No" sourceRef="BE_GW_Auth" targetRef="BE_End_401" />
    <bpmn:sequenceFlow id="BE_F4" sourceRef="BE_CheckRole" targetRef="BE_GW_Role" />
    <bpmn:sequenceFlow id="BE_F5_Yes" name="Si" sourceRef="BE_GW_Role" targetRef="BE_Sanitize" />
    <bpmn:sequenceFlow id="BE_F5_No" name="No" sourceRef="BE_GW_Role" targetRef="BE_End_403" />
    <bpmn:sequenceFlow id="BE_F6" sourceRef="BE_Sanitize" targetRef="BE_ValidateServer" />
    <bpmn:sequenceFlow id="BE_F7" sourceRef="BE_ValidateServer" targetRef="BE_GW_Valid" />
    <bpmn:sequenceFlow id="BE_F8_Yes" name="Si" sourceRef="BE_GW_Valid" targetRef="BE_CheckDuplicate" />
    <bpmn:sequenceFlow id="BE_F8_No" name="No" sourceRef="BE_GW_Valid" targetRef="BE_End_422" />
    <bpmn:sequenceFlow id="BE_F9" sourceRef="BE_CheckDuplicate" targetRef="BE_GW_Dup" />
    <bpmn:sequenceFlow id="BE_F10_New" name="No existe" sourceRef="BE_GW_Dup" targetRef="BE_ValidateFile" />
    <bpmn:sequenceFlow id="BE_F10_Dup" name="Ya existe" sourceRef="BE_GW_Dup" targetRef="BE_End_409" />
    <bpmn:sequenceFlow id="BE_F11" sourceRef="BE_ValidateFile" targetRef="BE_UploadCloud" />
    <bpmn:sequenceFlow id="BE_F12" sourceRef="BE_UploadCloud" targetRef="BE_SaveDB" />
    <bpmn:sequenceFlow id="BE_F13" sourceRef="BE_SaveDB" targetRef="BE_AuditLog" />
    <bpmn:sequenceFlow id="BE_F14" sourceRef="BE_AuditLog" targetRef="BE_End_201" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_BE">
    <bpmndi:BPMNPlane id="BPMNPlane_BE" bpmnElement="Process_Backend">
      <bpmndi:BPMNShape id="BE_Start_di" bpmnElement="BE_Start"><dc:Bounds x="152" y="232" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_AuthMiddleware_di" bpmnElement="BE_AuthMiddleware"><dc:Bounds x="240" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_GW_Auth_di" bpmnElement="BE_GW_Auth" isMarkerVisible="true"><dc:Bounds x="385" y="225" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_End_401_di" bpmnElement="BE_End_401"><dc:Bounds x="392" y="362" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_CheckRole_di" bpmnElement="BE_CheckRole"><dc:Bounds x="490" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_GW_Role_di" bpmnElement="BE_GW_Role" isMarkerVisible="true"><dc:Bounds x="635" y="225" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_End_403_di" bpmnElement="BE_End_403"><dc:Bounds x="642" y="362" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_Sanitize_di" bpmnElement="BE_Sanitize"><dc:Bounds x="740" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_ValidateServer_di" bpmnElement="BE_ValidateServer"><dc:Bounds x="890" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_GW_Valid_di" bpmnElement="BE_GW_Valid" isMarkerVisible="true"><dc:Bounds x="1035" y="225" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_End_422_di" bpmnElement="BE_End_422"><dc:Bounds x="1042" y="362" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_CheckDuplicate_di" bpmnElement="BE_CheckDuplicate"><dc:Bounds x="1140" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_GW_Dup_di" bpmnElement="BE_GW_Dup" isMarkerVisible="true"><dc:Bounds x="1285" y="225" width="50" height="50" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_End_409_di" bpmnElement="BE_End_409"><dc:Bounds x="1292" y="362" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_ValidateFile_di" bpmnElement="BE_ValidateFile"><dc:Bounds x="1390" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_UploadCloud_di" bpmnElement="BE_UploadCloud"><dc:Bounds x="1540" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_SaveDB_di" bpmnElement="BE_SaveDB"><dc:Bounds x="1690" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_AuditLog_di" bpmnElement="BE_AuditLog"><dc:Bounds x="1840" y="210" width="100" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BE_End_201_di" bpmnElement="BE_End_201"><dc:Bounds x="1992" y="232" width="36" height="36" /></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="BE_F1_di" bpmnElement="BE_F1"><di:waypoint x="188" y="250" /><di:waypoint x="240" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F2_di" bpmnElement="BE_F2"><di:waypoint x="340" y="250" /><di:waypoint x="385" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F3_Yes_di" bpmnElement="BE_F3_Yes"><di:waypoint x="435" y="250" /><di:waypoint x="490" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F3_No_di" bpmnElement="BE_F3_No"><di:waypoint x="410" y="275" /><di:waypoint x="410" y="362" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F4_di" bpmnElement="BE_F4"><di:waypoint x="590" y="250" /><di:waypoint x="635" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F5_Yes_di" bpmnElement="BE_F5_Yes"><di:waypoint x="685" y="250" /><di:waypoint x="740" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F5_No_di" bpmnElement="BE_F5_No"><di:waypoint x="660" y="275" /><di:waypoint x="660" y="362" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F6_di" bpmnElement="BE_F6"><di:waypoint x="840" y="250" /><di:waypoint x="890" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F7_di" bpmnElement="BE_F7"><di:waypoint x="990" y="250" /><di:waypoint x="1035" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F8_Yes_di" bpmnElement="BE_F8_Yes"><di:waypoint x="1085" y="250" /><di:waypoint x="1140" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F8_No_di" bpmnElement="BE_F8_No"><di:waypoint x="1060" y="275" /><di:waypoint x="1060" y="362" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F9_di" bpmnElement="BE_F9"><di:waypoint x="1240" y="250" /><di:waypoint x="1285" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F10_New_di" bpmnElement="BE_F10_New"><di:waypoint x="1335" y="250" /><di:waypoint x="1390" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F10_Dup_di" bpmnElement="BE_F10_Dup"><di:waypoint x="1310" y="275" /><di:waypoint x="1310" y="362" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F11_di" bpmnElement="BE_F11"><di:waypoint x="1490" y="250" /><di:waypoint x="1540" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F12_di" bpmnElement="BE_F12"><di:waypoint x="1640" y="250" /><di:waypoint x="1690" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F13_di" bpmnElement="BE_F13"><di:waypoint x="1790" y="250" /><di:waypoint x="1840" y="250" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BE_F14_di" bpmnElement="BE_F14"><di:waypoint x="1940" y="250" /><di:waypoint x="1992" y="250" /></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>"""

# Seed data for initial projects and diagrams
from datetime import datetime, timezone

SEED_PROJECTS = [
    {
        "id": "5ad98a45-a536-4fd8-a9e0-051f40d26ce4",
        "name": "LTI",
        "description": "Applicant Tracking System - Sistema de seguimiento de candidatos",
        "color": "#7C3AED",
        "icon": "folder",
        "tags": ["LTI", "ATS", "recruitment"],
        "diagram_ids": [
            "d6d679b3-a1e7-4609-adbe-f4066fc1b38f",
            "0dac3518-e16d-4baf-a575-45a8e7970433",
            "8d0ec4cb-05e9-4f0b-af22-afdef63954b5"
        ],
        "created_by": "system"
    },
    {
        "id": "34cdbb9e-656c-4bc6-a403-45cc2b81721f",
        "name": "Sistema de Ventas",
        "description": "Procesos de ventas y facturacion",
        "color": "#2563EB",
        "icon": "briefcase",
        "tags": ["ventas", "ecommerce"],
        "diagram_ids": [],
        "created_by": "system"
    },
    {
        "id": "dda651a1-8c60-4245-89c3-5bd1978196ac",
        "name": "DevOps Pipeline",
        "description": "CI/CD y deployment",
        "color": "#D97706",
        "icon": "rocket",
        "tags": ["devops", "ci-cd"],
        "diagram_ids": [],
        "created_by": "system"
    },
    {
        "id": "40014cba-271f-4757-ab79-2ab3bb673484",
        "name": "Gestion de RRHH",
        "description": "Procesos de recursos humanos",
        "color": "#059669",
        "icon": "building",
        "tags": ["rrhh", "empleados"],
        "diagram_ids": [],
        "created_by": "system"
    }
]

SEED_DIAGRAMS = [
    {
        "id": "d6d679b3-a1e7-4609-adbe-f4066fc1b38f",
        "name": "Flujo Principal - Anadir Nuevo Candidato",
        "description": "Proceso end-to-end del reclutador para registrar un candidato en la plataforma LTI. Incluye acceso al formulario, validacion, carga de CV, confirmacion y notificaciones.",
        "current_xml": FLUJO_PRINCIPAL_XML,
        "current_version": 1,
        "tags": ["LTI", "candidatos"],
        "created_by": "system"
    },
    {
        "id": "0dac3518-e16d-4baf-a575-45a8e7970433",
        "name": "Frontend - Formulario Anadir Candidato",
        "description": "Desglose tecnico frontend: componente formulario con validaciones real-time, drag-and-drop CV, previsualizacion PDF, consumo API con loading states.",
        "current_xml": FRONTEND_XML,
        "current_version": 1,
        "tags": ["LTI", "frontend"],
        "created_by": "system"
    },
    {
        "id": "8d0ec4cb-05e9-4f0b-af22-afdef63954b5",
        "name": "Backend + Seguridad - API Candidatos",
        "description": "Endpoint POST /candidates: validacion server-side, sanitizacion XSS/SQL injection, verificacion duplicados, almacenamiento CV en Cloud Storage, notificaciones async.",
        "current_xml": BACKEND_XML,
        "current_version": 1,
        "tags": ["LTI", "backend"],
        "created_by": "system"
    }
]
