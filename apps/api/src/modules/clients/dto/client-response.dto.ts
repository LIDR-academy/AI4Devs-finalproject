export class ClientResponseDto {
  id!: string;
  fullName!: string;
  nationalId!: string;
  phone!: string | null;
  email!: string | null;
  createdAt!: Date;
}
