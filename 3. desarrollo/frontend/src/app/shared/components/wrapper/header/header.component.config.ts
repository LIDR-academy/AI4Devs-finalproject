import { ButtonTyped, IconType } from "app/shared/layout/type";

export interface HeaderWrapperButtonInterface {
  id: ButtonTyped,
  label: string,
  icon: IconType,
  mode: 'primary' | 'secondary'
}