import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";
import { VendorInputDto } from "./dto/vendor-input.dto";
import { VendorDirectoryService } from "./vendor-directory.service";

@UseGuards(RolesGuard)
@Roles("supervisor")
@Controller("vendors")
export class VendorDirectoryController {
  constructor(private readonly vendorDirectoryService: VendorDirectoryService) {}

  @Get()
  list() {
    return this.vendorDirectoryService.listAll();
  }

  @Post()
  create(@Body() dto: VendorInputDto) {
    return this.vendorDirectoryService.create(dto);
  }

  @Patch(":vendorId")
  update(@Param("vendorId") vendorId: string, @Body() dto: VendorInputDto) {
    return this.vendorDirectoryService.update(vendorId, dto);
  }
}
