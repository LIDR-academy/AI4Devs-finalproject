export class MemberResponseDto {
  memberId!: string;
  roleId!: string;
  email!: string;
  firstName!: string;
  lastName!: string;
  dni?: string;
  membershipNumber?: string;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}
