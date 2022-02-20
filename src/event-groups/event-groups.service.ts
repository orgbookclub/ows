import { Injectable } from '@nestjs/common';
import { CreateEventGroupDto } from './dto/create-event-group.dto';
import { UpdateEventGroupDto } from './dto/update-event-group.dto';

@Injectable()
export class EventGroupsService {
  create(createEventGroupDto: CreateEventGroupDto) {
    return 'This action adds a new eventGroup';
  }

  findAll() {
    return `This action returns all eventGroups`;
  }

  findOne(id: number) {
    return `This action returns a #${id} eventGroup`;
  }

  update(id: number, updateEventGroupDto: UpdateEventGroupDto) {
    return `This action updates a #${id} eventGroup`;
  }

  remove(id: number) {
    return `This action removes a #${id} eventGroup`;
  }
}
