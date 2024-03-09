import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { errorCode, successCode, successGetPage } from 'src/config/respone.service';
import { BlogCreateDto, BlogUpdateDto } from 'src/dto/blog.dto';
import { convertTsVector } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()

@Injectable()
export class BlogService {

    async create(blogData: BlogCreateDto) {
        let { tag_id, type_toure_id, ...dataBlogCreate } = blogData

        try {
            let newBlog = await prisma.blog.create({ data: dataBlogCreate })

            // Create foreign key
            if (blogData.tag_id) {
                blogData.tag_id.map((el: any, idx: any) => {
                    const findTag = async () => {
                        let getTag = await prisma.tag.findFirst({ where: { id: el } })
                        if (getTag) await prisma.blog_tag.create({
                            data: { tag_id: el, blog_id: newBlog.id }
                        })
                    }
                    findTag()
                })
            }
            if (blogData.type_toure_id) {
                blogData.type_toure_id.map((el: any, idx: any) => {
                    const findTypeToure = async () => {
                        let getTypeToure = await prisma.type_toure.findFirst({ where: { id: el } })
                        if (getTypeToure) await prisma.blog_type_toure.create({
                            data: { type_toure_id: el, blog_id: newBlog.id }
                        })
                    }
                    findTypeToure()
                })
            }

            return successCode({ newBlog }, "Blog created successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOne(id: number) {
        try {
            let dataFind = await prisma.blog.findFirst({
                where: { id },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(blogInfo: BlogUpdateDto, id: number) {
        let { tag_id, type_toure_id, ...blogUpdate } = blogInfo

        try {
            await prisma.blog.update({
                where: { id },
                data: blogUpdate
            })

            // Update foreign key
            if (blogInfo?.tag_id && blogInfo?.tag_id?.length > 0) {
                let getBlogTag = await prisma.blog_tag.findMany({
                    where: { blog_id: id }
                })
                if (getBlogTag) await getBlogTag?.map(el => {
                    const deleteBlogTag = async () => {
                        await prisma.blog_tag.delete({ where: { id: el.id } })
                    }
                    deleteBlogTag()
                })

                await blogInfo.tag_id.map((el: any, idx: any) => {
                    const findTag = async () => {
                        let getTag = await prisma.tag.findFirst({ where: { id: el } })
                        if (getTag) await prisma.blog_tag.create({
                            data: { tag_id: el, blog_id: id }
                        })
                    }
                    findTag()
                })
            }
            if (blogInfo?.type_toure_id && blogInfo?.type_toure_id?.length > 0) {
                let getBlogTypeToure = await prisma.blog_type_toure.findMany({
                    where: { blog_id: id }
                })
                if (getBlogTypeToure) await getBlogTypeToure?.map(el => {
                    const deleteBlogTypeToure = async () => {
                        await prisma.blog_type_toure.delete({ where: { id: el.id } })
                    }
                    deleteBlogTypeToure()
                })

                await blogInfo.type_toure_id.map((el: any, idx: any) => {
                    const findTypeToure = async () => {
                        let getTypeToure = await prisma.type_toure.findFirst({ where: { id: el } })
                        if (getTypeToure) await prisma.blog_type_toure.create({
                            data: { type_toure_id: el, blog_id: id }
                        })
                    }
                    findTypeToure()
                })
            }

            return successCode(blogInfo, "Blog updated successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async delete(id: number) {
        try {
            await prisma.blog.delete({
                where: { id },
            })

            let getBlogTag = await prisma.blog_tag.findMany({
                where: { blog_id: id }
            })
            if (getBlogTag) await getBlogTag?.map(el => {
                const deleteBlogTag = async () => {
                    await prisma.blog_tag.delete({ where: { id: el.id } })
                }
                deleteBlogTag()
            })

            let getBlogTypeTour = await prisma.blog_type_toure.findMany({
                where: { blog_id: id }
            })
            if (getBlogTypeTour) await getBlogTypeTour?.map(el => {
                const deleteBlogTypeTour = async () => {
                    await prisma.blog_type_toure.delete({ where: { id: el.id } })
                }
                deleteBlogTypeTour()
            })

            return successCode({ id }, "Blog deleted successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getBlog(
        keySearch: string,
        pageNumber: number,
        pageSize: number,
        user_id: number,
        tag_id: number[],
        type_toure_id: number[]) {
        try {
            let findTag = await prisma.blog_tag.findMany({ where: { tag_id: { in: tag_id } } })
            let findTypeToure = await prisma.blog_type_toure.findMany({ where: { type_toure_id: { in: type_toure_id } } })

            const generateAndCondition = () => {
                const conditions = [];
                if (findTag && findTag?.length > 0) conditions.push({ id: { in: findTag.map(el => el.blog_id) } },)
                if (findTypeToure && findTypeToure?.length > 0) conditions.push({ id: { in: findTypeToure.map(el => el.blog_id) } },)
                if (user_id) conditions.push({ user_id },)
                return conditions
            }

            let data = await prisma.blog.findMany({
                where: {
                    OR: [
                        { title: { search: convertTsVector(keySearch) } },
                        { title: { mode: 'insensitive', contains: keySearch, } },
                        { content: { mode: 'insensitive', contains: keySearch, } },
                    ],
                    AND: generateAndCondition()
                },
                include: {
                    blog_tag: {
                        include: { tag: true }
                    },
                    blog_type_toure: {
                        include: { type_toure: true }
                    }
                },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            })
            let countTotalData = await prisma.blog.count({
                where: {
                    OR: [
                        { title: { search: convertTsVector(keySearch) } },
                        { title: { mode: 'insensitive', contains: keySearch, } },
                        { content: { mode: 'insensitive', contains: keySearch, } },
                    ],
                    AND: generateAndCondition()
                },
            })

            return successGetPage(data, pageNumber, pageSize, countTotalData)
        } catch (error) {
            return errorCode(error.message)
        }
    };
}