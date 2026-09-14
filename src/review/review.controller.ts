import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  
} from '@nestjs/common';

import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateReviewDto } from './dto/update-review.dto';

import { UserRole } from '@prisma/client';

@Controller('review')
export class ReviewController {

  constructor(
    private readonly reviewService: ReviewService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  createReview(
    @CurrentUser() user: any,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(
      user.id,
      dto,
    );
  }

    @Get('worker/:workerId')
    getWorkerReviews(
    @Param('workerId') workerId: string,
    ) {
    return this.reviewService.getWorkerReviews(
        workerId,
    );
    }

    @Get(':reviewId')
getReviewDetails(
  @Param('reviewId') reviewId: string,
) {
  return this.reviewService.getReviewDetails(
    reviewId,
  );
}


@Put(':reviewId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
updateReview(
  @CurrentUser() user: any,
  @Param('reviewId') reviewId: string,
  @Body() dto: UpdateReviewDto,
) {
  return this.reviewService.updateReview(
    user.id,
    reviewId,
    dto,
  );
}


@Delete(':reviewId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
deleteReview(
  @CurrentUser() user: any,
  @Param('reviewId') reviewId: string,
) {
  return this.reviewService.deleteReview(
    user.id,
    reviewId,
  );
}

}