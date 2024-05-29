import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService){}
  async create(createUserDto: CreateUserDto) {
    const {email, name, password} = createUserDto;
    const existingUserEmail = await this.prisma.user.findUnique({
      where: {email}
    })
    if(existingUserEmail){
      throw new ConflictException('Email já esta em uso');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        name,
        password : hashedPassword
      }
    })
  }
  
  async findAll() { 
    return await this.prisma.user.findMany()
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {id}
    })
    if (!user){
      throw new NotFoundException(`Usuario não encontrado com o id : ${id}`)
    }
    return user
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {id}
    })
    if (!existingUser) {
      throw new NotFoundException(`Usuario não encontrado com o id : ${id}`)
    }
    const updateUser = await this.prisma.user.update({
      where:{id},
      data: updateUserDto
    })
    return updateUser
  }

  async remove(id: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: {id}
    })
    if (!existingUser) {
      throw new NotFoundException(`Usuario não encontado com id : ${id}`)
    }
    await this.prisma.user.delete({
      where:{id}
    })
    return `Usuario deletado` 
  }
}
