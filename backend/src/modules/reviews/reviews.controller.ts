import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewCommentDto, ReviewDecisionDto } from './dto/review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { User } from '../../entities/user.entity';
import { UserRole } from '../../entities/enums';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('pending')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  findPending() {
    return this.reviewsService.findPending();
  }

  @Get('submissions/:id')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Post('submissions/:id/comments')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  addComment(
    @Param('id') id: string,
    @Body() dto: ReviewCommentDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.addComment(id, dto, user);
  }

  @Post('submissions/:id/decide')
  @Roles(UserRole.REVIEWER, UserRole.ADMIN)
  decide(
    @Param('id') id: string,
    @Body() dto: ReviewDecisionDto,
    @CurrentUser() user: User,
  ) {
    return this.reviewsService.decide(id, dto, user);
  }
}
