import { IsUUID } from 'class-validator'

export class UuidParamDto {
  @IsUUID('4')
  id: string
}

export class OrgScopedParamsDto {
  @IsUUID('4')
  orgId: string
}

export class OrgScopedResourceParamsDto extends OrgScopedParamsDto {
  @IsUUID('4')
  id: string
}
