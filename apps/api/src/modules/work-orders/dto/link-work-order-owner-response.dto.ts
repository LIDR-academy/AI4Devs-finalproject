export class LinkedOwnerSummaryDto {
  fullName!: string;
  nationalId!: string;
}

export class LinkWorkOrderOwnerResponseDto {
  id!: string;
  ownerClientId!: string;
  owner!: LinkedOwnerSummaryDto;
  broughtByName!: string | null;
  broughtByPhone!: string | null;
  vehicleOwnerUnchanged!: boolean;
  updatedAt!: Date;
}
