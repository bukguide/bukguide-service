import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UserCreateDto, UserLoginDto, UserUpdateDto } from '../dto/users.dto';
import * as bcrypt from 'bcrypt';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

const prisma = new PrismaClient()

@Injectable()
export class UsersService {
    constructor(private jwtService: JwtService, private config: ConfigService) { }

    async getUsers(keySearch: string,
        pageNumber: number,
        pageSize: number,
        approve: string,
        permission_id: number,
        language_id: number[],
        location_id: number[],
        type_tour_id: number[],
        expertise_id: number[],
    ) {
        try {
            let findLanguage = await prisma.user_language.findMany({ where: { language_id: { in: language_id } } })
            let findLocation = await prisma.user_location.findMany({ where: { location_id: { in: location_id } } })
            let findTypeTour = await prisma.user_type_tour.findMany({ where: { type_tour_id: { in: type_tour_id } } })
            let findExpertise = await prisma.user_expertise.findMany({ where: { expertise_id: { in: expertise_id } } })

            const generateAndCondition = () => {
                const conditions = [];
                if (findLanguage && findLanguage?.length > 0) conditions.push({ id: { in: findLanguage.map(el => el.user_id) } },)
                if (findLocation && findLocation?.length > 0) conditions.push({ id: { in: findLocation.map(el => el.user_id) } },)
                if (findTypeTour && findTypeTour?.length > 0) conditions.push({ id: { in: findTypeTour.map(el => el.user_id) } },)
                if (findExpertise && findExpertise?.length > 0) conditions.push({ id: { in: findExpertise.map(el => el.user_id) } },)
                if (permission_id) conditions.push({ permission_id },)
                approve === "true" ? conditions.push({ approve: true }) : conditions.push({ approve: false })
                return conditions
            }

            let data = await prisma.user_info.findMany({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                        { email: { mode: 'insensitive', contains: keySearch, } },
                    ],
                    AND: generateAndCondition()
                },
                include: {
                    permission: true,
                    user_language: {
                        include: { language: true }
                    },
                    user_location: {
                        include: { location: true }
                    },
                    user_type_tour: {
                        include: { type_tour: true }
                    },
                    user_expertise: {
                        include: { expertise: true }
                    },
                    _count: {
                        select: { blog: true }
                    }
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize,
            })
            let countTotalData = await prisma.user_info.count({
                where: {
                    OR: [
                        { name: { search: convertTsVector(keySearch) } },
                        { name: { mode: 'insensitive', contains: keySearch, } },
                        { email: { mode: 'insensitive', contains: keySearch, } },
                    ],
                    AND: generateAndCondition()
                },
            })

            const dataRemovePassword = data?.map((el: any) => {
                const { password, permission, approve, ...removePas } = el
                return removePas
            })

            return successGetPage(dataRemovePassword, pageNumber, pageSize, countTotalData)
        } catch (error) {
            return errorCode(error.message)
        }
    };

    async signup(userInfo: UserCreateDto) {
        // Check param
        if (!userInfo.email) return failCode("Email not provided")
        if (!userInfo.name) return failCode("Name not provided")
        if (!userInfo.password) return failCode("Password not provided")
        if (!userInfo.permission_id) return failCode("Permission_id not provided")

        // Check if user already exists
        let checkEmail = await prisma.user_info.findFirst({ where: { email: userInfo.email } })
        let checkEmirates_id = await prisma.user_info.findFirst({ where: { emirates_id: userInfo.emirates_id } })
        let checkLicense_no = await prisma.user_info.findFirst({ where: { license_no: userInfo.license_no } })
        let checkNumber_phone = await prisma.user_info.findFirst({ where: { number_phone: userInfo.number_phone } })

        if (checkEmail) return failCode("Email already exists!")
        if (checkEmirates_id) return failCode("Emirates id already exists!")
        if (checkLicense_no) return failCode("License no already exists!")
        if (checkNumber_phone) return failCode("Number phone already exists!")

        // HashSync user information
        const maxIdUser = await maxId(prisma.user_info)
        let { location_id, language_id, type_tour_id, expertise_id, ...dataUserInfo } = userInfo
        let dataUserCreate: any = {
            ...dataUserInfo,
            id: maxIdUser,
            password: bcrypt.hashSync(userInfo.password, 10),
            created_at: new Date(),
            updated_at: new Date(),
            approve: false,
        }

        try {
            let newUser = await prisma.user_info.create({ data: dataUserCreate })

            // Create foreign key
            if (userInfo.language_id) {
                userInfo.language_id.map((el: any, idx: any) => {
                    const findLanguage = async () => {
                        const maxIdUserLanguage = await maxId(prisma.user_language)
                        let getLanguage = await prisma.language.findFirst({ where: { id: el } })
                        if (getLanguage) await prisma.user_language.create({
                            data: { language_id: el, user_id: newUser.id, id: maxIdUserLanguage }
                        })
                    }
                    findLanguage()
                })
            }
            if (userInfo.location_id) {
                userInfo.location_id.map((el: any, idx: any) => {
                    const findLocation = async () => {
                        const maxIdUserLocation = await maxId(prisma.user_location)
                        let getLocation = await prisma.location.findFirst({ where: { id: el } })
                        if (getLocation) await prisma.user_location.create({
                            data: { location_id: el, user_id: newUser.id, id: maxIdUserLocation }
                        })
                    }
                    findLocation()
                })
            }
            if (userInfo.type_tour_id) {
                userInfo.type_tour_id.map((el: any, idx: any) => {
                    const findTypeTour = async () => {
                        const maxIdTypeTour = await maxId(prisma.user_type_tour)
                        let getTypeTour = await prisma.type_tour.findFirst({ where: { id: el } })
                        if (getTypeTour) await prisma.user_type_tour.create({
                            data: { type_tour_id: el, user_id: newUser.id, id: maxIdTypeTour }
                        })
                    }
                    findTypeTour()
                })
            }
            if (userInfo.expertise_id) {
                userInfo.expertise_id.map((el: any, idx: any) => {
                    const findExpertise = async () => {
                        const maxIdUserExpertite = await maxId(prisma.user_expertise)
                        let getExpertise = await prisma.expertise.findFirst({ where: { id: el } })
                        if (getExpertise) await prisma.user_expertise.create({
                            data: { expertise_id: el, user_id: newUser.id, id: maxIdUserExpertite }
                        })
                    }
                    findExpertise()
                })
            }

            return successCode({ userName: newUser.name }, "User created successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(userInfo: UserUpdateDto, id: number) {
        let { language_id, location_id, type_tour_id, expertise_id, ...userUpdate } = userInfo

        try {
            await prisma.user_info.update({
                where: { id },
                data: { ...userUpdate, updated_at: new Date() }
            })

            // Update foreign key
            if (userInfo?.language_id /*&& userInfo?.language_id?.length > 0*/) {
                let getUserLanguage = await prisma.user_language.findMany({
                    where: { user_id: id }
                })
                if (getUserLanguage) await getUserLanguage?.map(el => {
                    const deleteUserLanguage = async () => {
                        await prisma.user_language.delete({ where: { id: el.id } })
                    }
                    deleteUserLanguage()
                })

                await userInfo.language_id.map((el: any, idx: any) => {
                    const findLanguage = async () => {
                        const maxIdUserLanguage = await maxId(prisma.user_language)
                        let getLanguage = await prisma.language.findFirst({ where: { id: el } })
                        if (getLanguage) await prisma.user_language.create({
                            data: { language_id: el, user_id: id, id: maxIdUserLanguage }
                        })
                    }
                    findLanguage()
                })
            }
            if (userInfo?.location_id /*&& userInfo?.location_id?.length > 0*/) {
                let getUserLocation = await prisma.user_location.findMany({
                    where: { user_id: id }
                })
                if (getUserLocation) await getUserLocation?.map(el => {
                    const deleteUserLocation = async () => {
                        await prisma.user_location.delete({ where: { id: el.id } })
                    }
                    deleteUserLocation()
                })

                await userInfo.location_id.map((el: any, idx: any) => {
                    const findLocation = async () => {
                        const maxIdUserLocation = await maxId(prisma.user_location)
                        let getLocation = await prisma.location.findFirst({ where: { id: el } })
                        if (getLocation) await prisma.user_location.create({
                            data: { location_id: el, user_id: id, id: maxIdUserLocation }
                        })
                    }
                    findLocation()
                })
            }
            if (userInfo?.type_tour_id /*&& userInfo?.type_tour_id?.length > 0*/) {
                let getUserTypeTour = await prisma.user_type_tour.findMany({
                    where: { user_id: id }
                })
                if (getUserTypeTour) await getUserTypeTour?.map(el => {
                    const deleteUserTypeTour = async () => {
                        await prisma.user_type_tour.delete({ where: { id: el.id } })
                    }
                    deleteUserTypeTour()
                })

                await userInfo.type_tour_id.map((el: any, idx: any) => {
                    const findTypeTour = async () => {
                        const maxIdTypeTour = await maxId(prisma.user_type_tour)
                        let getTypeTour = await prisma.type_tour.findFirst({ where: { id: el } })
                        if (getTypeTour) await prisma.user_type_tour.create({
                            data: { type_tour_id: el, user_id: id, id: maxIdTypeTour }
                        })
                    }
                    findTypeTour()
                })
            }
            if (userInfo?.expertise_id /*&& userInfo?.expertise_id?.length > 0*/) {
                let getUserExpertise = await prisma.user_expertise.findMany({
                    where: { user_id: id }
                })
                if (getUserExpertise) await getUserExpertise?.map(el => {
                    const deleteUserExpertise = async () => {
                        await prisma.user_expertise.delete({ where: { id: el.id } })
                    }
                    deleteUserExpertise()
                })

                await userInfo.expertise_id.map((el: any, idx: any) => {
                    const findExpertise = async () => {
                        const maxIdUserExpertite = await maxId(prisma.user_expertise)
                        let getExpertise = await prisma.expertise.findFirst({ where: { id: el } })
                        if (getExpertise) await prisma.user_expertise.create({
                            data: { expertise_id: el, user_id: id, id: maxIdUserExpertite }
                        })
                    }
                    findExpertise()
                })
            }

            return successCode(userInfo, "User updated successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async approve(id: number) {
        try {
            let findUser = await prisma.user_info.findFirst({ where: { id } })
            if (!findUser) return failCode("User not found!")

            await prisma.user_info.update({
                where: { id },
                data: { approve: true }
            })
            return successCode({ username: findUser.name }, "User approved successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async unApprove(id: number) {
        try {
            let findUser = await prisma.user_info.findFirst({ where: { id } })
            if (!findUser) return failCode("User not found!")

            await prisma.user_info.update({
                where: { id },
                data: { approve: false }
            })
            return successCode({ username: findUser.name }, "User approved successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOne(id: number) {
        try {
            let dataFind = await prisma.user_info.findFirst({
                where: { id },
                include: {
                    permission: true,
                    user_language: {
                        include: { language: true }
                    },
                    user_location: {
                        include: { location: true }
                    },
                    user_type_tour: {
                        include: { type_tour: true }
                    },
                    user_expertise: {
                        include: { expertise: true }
                    },
                }
            })
            let { password, ...dataResult } = dataFind
            return successCode(dataResult, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async delete(id: number) {
        try {
            let getUserLocation = await prisma.user_location.findMany({
                where: { user_id: id }
            })
            if (getUserLocation) await getUserLocation?.map(el => {
                const deleteUserLocation = async () => {
                    await prisma.user_location.delete({ where: { id: el.id } })
                }
                deleteUserLocation()
            })

            let getUserLanguage = await prisma.user_language.findMany({
                where: { user_id: id }
            })
            if (getUserLanguage) await getUserLanguage?.map(el => {
                const deleteUserLanguage = async () => {
                    await prisma.user_language.delete({ where: { id: el.id } })
                }
                deleteUserLanguage()
            })

            let getUserTypeTour = await prisma.user_type_tour.findMany({
                where: { user_id: id }
            })
            if (getUserTypeTour) await getUserTypeTour?.map(el => {
                const deleteUserTypeTour = async () => {
                    await prisma.user_type_tour.delete({ where: { id: el.id } })
                }
                deleteUserTypeTour()
            })
            let getUserExpertise = await prisma.user_expertise.findMany({
                where: { user_id: id }
            })
            if (getUserExpertise) await getUserExpertise?.map(el => {
                const deleteUserExpertise = async () => {
                    await prisma.user_expertise.delete({ where: { id: el.id } })
                }
                deleteUserExpertise()
            })

            await prisma.user_info.delete({
                where: { id },
            })
            return successCode({ id }, "User deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async login(userLogin: UserLoginDto) {
        try {
            let checkUser = await prisma.user_info.findFirst({
                where: { email: userLogin.email },
                include: { permission: true }
            })
            if (!checkUser) return failCode("Email not found!")
            if (!checkUser.approve) return failCode("Your account has not been approved, please wait for the moderation email")

            if (bcrypt.compareSync(userLogin.password, checkUser.password)) {
                let { password, ...data } = { ...checkUser }
                let token = this.jwtService.sign(
                    { data: data },
                    {
                        expiresIn: '72h',
                        secret: this.config.get('SECRET_KEY')
                    }
                )
                return successCode({ token: token }, "Login successful!")
            } else {
                return failCode("Passwords incorrect!")
            }
        } catch (error) {
            return errorCode(error.message)
        }
    }
}
