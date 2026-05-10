import { Controller, Post, Get, Body, Query, Req, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { GetUser, JwtPayload, Public } from '../../common/decorators';
import { IsEnum, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { PaymentType } from '@prisma/client';

class CreateOrderDto {
  @IsInt()
  @Min(100)
  amount: number; // in paise

  @IsEnum(PaymentType)
  type: PaymentType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

class VerifyPaymentDto {
  @IsString() razorpayOrderId: string;
  @IsString() razorpayPaymentId: string;
  @IsString() razorpaySignature: string;
}

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @Post('create-order')
  @ApiOperation({ summary: 'Create Razorpay order' })
  createOrder(@GetUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.paymentsService.createOrder(user.orgId, dto.amount, dto.type, dto.metadata);
  }

  @ApiBearerAuth()
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify Razorpay payment signature' })
  verify(@Body() dto: VerifyPaymentDto) {
    return this.paymentsService.verifyPayment(
      dto.razorpayOrderId,
      dto.razorpayPaymentId,
      dto.razorpaySignature,
    );
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Razorpay webhook handler' })
  async webhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const body = JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(body, signature);
  }

  @ApiBearerAuth()
  @Get('history')
  @ApiOperation({ summary: 'Payment history for current org' })
  history(
    @GetUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.paymentsService.getHistory(user.orgId, +page, +limit);
  }
}
