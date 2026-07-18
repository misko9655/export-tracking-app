import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { PagePermission, User, UserDocument } from "./users.schema";
import { Model } from "mongoose";

import * as password from 'password-hash-and-salt';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


@Injectable()
export class AuthService {

     SALT_ROUNDS = 10;
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async login(username: string, plainPassword: string) {
        const user = await this.userModel.findOne({ username });

        if (!user) {
            throw new UnauthorizedException();
        }

        const isPasswordCorrect = await this.comparePassword(plainPassword, user.passwordHash);

        if (!isPasswordCorrect) {
            throw new UnauthorizedException();
        } 

        const authJwtToken = jwt.sign({username, roles: user.roles}, process.env.JWT_S, { expiresIn: '8h' });
        return {authJwtToken, user: {username: user.username, roles: user.roles}};
    }

    async create(username: string, plainPassword: string, roles: string[]) {
        const existing = await this.userModel.findOne({ username });
        if (existing) {
            throw new ConflictException('Korisničko ime već postoji');
        }
        const passwordHash = await this.hashPassword(plainPassword);
        const created = new this.userModel({ username, roles, passwordHash });
        await created.save();
        return { username: created.username, roles: created.roles };
    }

    async findAllUsers() {
        return this.userModel.find().select('username roles pagePermissions').sort({ username: 1 }).exec();
    }

    async updateUserPermissions(username: string, pagePermissions: Record<string, PagePermission> | null) {
        const updated = await this.userModel
            .findOneAndUpdate({ username }, { $set: { pagePermissions } }, { returnDocument: 'after' })
            .select('username roles pagePermissions')
            .exec();
        if (!updated) {
            throw new NotFoundException(`Korisnik ${username} nije pronađen`);
        }
        return updated;
    }

    // Hash password
async hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error: any) {
    throw new Error('Greška pri heširanju lozinke: ' + error.message);
  }
}

// Compare password with hash
async comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error: any) {
    throw new Error('Greška pri proveri lozinke: ' + error.message);
  }
}
}