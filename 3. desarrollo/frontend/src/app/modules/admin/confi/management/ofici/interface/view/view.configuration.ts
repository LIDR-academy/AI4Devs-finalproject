import { TblHeaderColumm } from "app/shared/components";
import { FormInterface } from "app/shared/components/forms/form.interface";


export const tableHeader: TblHeaderColumm[] = [
    { title: '#', name: 'ofici_cod_ofici' },
    { title: 'Nombre', name: 'ofici_nom_ofici', },
    { title: 'Tipo de Oficina', name: 'tofic_des_tofic', },
    { title: 'Dirección', name: 'ofici_dir_ofici', },
    { title: 'Acciones', name: 'actions', }
]

export const tableHeaderTofic: TblHeaderColumm[] = [
    { title: '#', name: 'tofic_cod_tofic' },
    { title: 'Tipo de oficina', name: 'tofic_des_tofic', },
    { title: 'Abreviación', name: 'tofic_abr_tofic', },
    { title: 'Acciones', name: 'actions', }
]


export const formConfig: FormInterface[] = [
    {
        type: 'hidden',
        label: 'Código',
        name: 'ofici_cod_ofici',
        placeholder: 'Ingrese la información solicitada',
        validations: []
    },
    {
        type: 'select',
        label: 'Empresa',
        name: 'ofici_cod_empre',
        placeholder: 'Tipo de oficina',
        validations: [
            { type: 'required', message: 'El campo es requerido' },
        ],
        options: []

    },
    {
        type: 'select-advanced',
        label: 'Tipo de oficina',
        name: 'ofici_cod_tofic',
        placeholder: 'Tipo de oficina',
        validations: [
            { type: 'required', message: 'El campo es requerido' },
        ],
        options: [],
    },
    {
        type: 'text',
        label: 'Nombre de la oficina',
        name: 'ofici_nom_ofici',
        placeholder: 'Ingrese la información solicitada',
        validations: [
            { type: 'required', message: 'El campo es requerido' },
            { type: 'minLength', value: 3, message: 'El campo debte de tener minimo 3 caracteres' }
        ]
    },
    {
        type: 'text',
        label: 'Dirección de Oficina',
        name: 'ofici_dir_ofici',
        placeholder: 'Ingrese la información solicitada',
        validations: [
            { type: 'required', message: 'El campo es requerido' },
            { type: 'minLength', value: 3, message: 'El campo debte de tener minimo 3 caracteres' },
        ]
    },

];