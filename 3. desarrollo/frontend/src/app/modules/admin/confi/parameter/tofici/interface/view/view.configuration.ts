import { TblHeaderColumm } from "app/shared/components";
import { FormInterface } from "app/shared/components/forms/form.interface";


export const tableHeader: TblHeaderColumm[] = [
    { title: '#', name: 'tofic_cod_tofic' },
    { title: 'Tipo de oficina', name: 'tofic_des_tofic', },
    { title: 'Abreviación', name: 'tofic_abr_tofic', },
    { title: 'Acciones', name: 'actions', }
]


export const formConfig: FormInterface[] = [
    {
        type: 'hidden',
        label: 'Código',
        name: 'tofic_cod_tofic',
        placeholder: 'Ingrese la información solicitada',
        validations: []
    },
    {
        type: 'text',
        label: 'Tipo de oficina',
        name: 'tofic_des_tofic',
        placeholder: 'Ingrese la información solicitada',
        validations: [
            { type: 'required', message: 'El campo es requerido' },
            { type: 'minLength', value: 3, message: 'El campo debte de tener minimo 3 caracteres' }
        ]
    },
    {
        type: 'text',
        label: 'Abreviación',
        name: 'tofic_abr_tofic',
        placeholder: 'Ingrese la información solicitada',
        validations: [
            { type: 'required', message: 'El campo es requerido' },
            { type: 'minLength', value: 2, message: 'El campo debte de tener minimo 3 caracteres' },
            { type: 'maxLength', value: 3, message: 'El campo debte de tener maximo 3 caracteres' },
        ]
    }
];