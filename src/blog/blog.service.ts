import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';
import { errorCode, failCode, successCode, successGetPage } from 'src/config/respone.service';
import { BlogCreateDto, BlogUpdateDto } from 'src/dto/blog.dto';
import { convertTsVector, maxId } from 'src/ultiService/ultiService';

const prisma = new PrismaClient()
const urlPattern = /https?:\/\/[^\s"]+/g;

@Injectable()
export class BlogService {

    async create(blogData: BlogCreateDto) {
        if (!blogData.title || blogData.title === "" || blogData.title?.length == 0) return failCode("Post must have a title!")

        const findBlogTitle = await prisma.blog.findFirst({
            where: { title: blogData.title }
        })

        if (findBlogTitle) return failCode("The title is duplicated with another article, please give another title!")

        let { tag_id, type_tour_id, ...dataBlogCreate } = blogData

        try {
            const maxIdBlog = await maxId(prisma.blog)
            let newBlog = await prisma.blog.create({
                data: { ...dataBlogCreate, id: maxIdBlog, created_at: new Date() }
            })

            // Create foreign key
            if (blogData.tag_id) {
                for (const el of blogData.tag_id) {
                    const findTag = async () => {
                        const maxIdBlogTag = await maxId(prisma.blog_tag)
                        let getTag = await prisma.tag.findFirst({ where: { id: el } })
                        if (getTag) await prisma.blog_tag.create({
                            data: { tag_id: el, blog_id: newBlog.id, id: maxIdBlogTag }
                        })
                    }
                    await findTag()
                }
            }
            if (blogData.type_tour_id) {
                for (const el of blogData.type_tour_id) {
                    const findTypeTour = async () => {
                        const maxIdBlogTypeTour = await maxId(prisma.blog_type_tour)
                        let getTypeTour = await prisma.type_tour.findFirst({ where: { id: el } })
                        if (getTypeTour) await prisma.blog_type_tour.create({
                            data: { type_tour_id: el, blog_id: newBlog.id, id: maxIdBlogTypeTour }
                        })
                    }
                    await findTypeTour()
                }
            }
            const urls = blogData.content.match(urlPattern);
            const maxIdImageBlog = await maxId(prisma.image_blog)
            if (urls && urls.length > 0) await prisma.image_blog.create({
                data: { file_name: urls[0], blog_id: newBlog.id, id: maxIdImageBlog }
            })

            return successCode(newBlog, "Blog created successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async getOne(id: number) {
        try {
            let dataFind = await prisma.blog.findFirst({
                where: { id },
                include: {
                    blog_tag: {
                        include: { tag: true }
                    },
                    blog_type_tour: {
                        include: { type_tour: true }
                    },
                    image_blog: true,
                    user_info: {
                        select: {
                            name: true,
                            id: true,
                            avatar: true
                        }
                    }
                },
            })
            return successCode(dataFind, "Successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async update(blogInfo: BlogUpdateDto, id: number) {
        if (!blogInfo.title || blogInfo.title === "") return failCode("Post must have a title!")

        let { tag_id, type_tour_id, ...blogUpdate } = blogInfo

        try {
            let updateBlog = await prisma.blog.update({
                where: { id },
                data: blogUpdate
            })

            // Update foreign key
            if (blogInfo?.tag_id && blogInfo?.tag_id?.length > 0) {
                let getBlogTag = await prisma.blog_tag.findMany({
                    where: { blog_id: id }
                })
                if (getBlogTag) for (const el of getBlogTag) {
                    const deleteBlogTag = async () => {
                        await prisma.blog_tag.delete({ where: { id: el.id } })
                    }
                    await deleteBlogTag()
                }
                for (const el of blogInfo.tag_id) {
                    const findTag = async () => {
                        const maxIdBlogTag = await maxId(prisma.blog_tag)
                        let getTag = await prisma.tag.findFirst({ where: { id: el } })
                        if (getTag) await prisma.blog_tag.create({
                            data: { tag_id: el, blog_id: id, id: maxIdBlogTag }
                        })
                    }
                    await findTag()
                }
            }
            if (blogInfo?.type_tour_id && blogInfo?.type_tour_id?.length > 0) {
                let getBlogTypeTour = await prisma.blog_type_tour.findMany({
                    where: { blog_id: id }
                })
                for (const el of getBlogTypeTour) {
                    const deleteBlogTypeTour = async () => {
                        await prisma.blog_type_tour.delete({ where: { id: el.id } })
                    }
                    await deleteBlogTypeTour()
                }
                for (const el of blogInfo.type_tour_id) {
                    const findTypeTour = async () => {
                        const maxIdBlogTypeTour = await maxId(prisma.blog_type_tour)
                        let getTypeTour = await prisma.type_tour.findFirst({ where: { id: el } })
                        if (getTypeTour) await prisma.blog_type_tour.create({
                            data: { type_tour_id: el, blog_id: id, id: maxIdBlogTypeTour }
                        })
                    }
                    await findTypeTour()
                }
            }
            const urls = blogInfo.content.match(urlPattern)
            const findImagesBlog = await prisma.image_blog.findMany({ where: { blog_id: id } })
            for (const img of findImagesBlog) {
                const deleteImageBlog = async () => {
                    await prisma.image_blog.delete({ where: { id: img.id } })
                }
                await deleteImageBlog()
            }
            const maxIdImageBlog = await maxId(prisma.image_blog)
            if (urls && urls.length > 0) await prisma.image_blog.create({
                data: { file_name: urls[0], blog_id: id, id: maxIdImageBlog }
            })

            return successCode(updateBlog, "Blog updated successfully!")
        } catch (error) {
            return errorCode(error.message)
        }
    }

    async delete(id: number) {
        try {
            let getBlogTag = await prisma.blog_tag.findMany({
                where: { blog_id: id }
            })
            if (getBlogTag) await getBlogTag?.map(el => {
                const deleteBlogTag = async () => {
                    await prisma.blog_tag.delete({ where: { id: el.id } })
                }
                deleteBlogTag()
            })

            let getBlogTypeTour = await prisma.blog_type_tour.findMany({
                where: { blog_id: id }
            })
            if (getBlogTypeTour) await getBlogTypeTour?.map(el => {
                const deleteBlogTypeTour = async () => {
                    await prisma.blog_type_tour.delete({ where: { id: el.id } })
                }
                deleteBlogTypeTour()
            })

            let getBlogImage = await prisma.image_blog.findMany({
                where: { blog_id: id }
            })
            if (getBlogImage) await getBlogImage?.map(el => {
                const deleteBlogImage = async () => {
                    await prisma.image_blog.delete({ where: { id: el.id } })
                }
                deleteBlogImage()
            })

            await prisma.blog.delete({
                where: { id },
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
        type_tour_id: number[]) {
        try {
            let findTag = await prisma.blog_tag.findMany({ where: { tag_id: { in: tag_id } } })
            let findTypeTour = await prisma.blog_type_tour.findMany({ where: { type_tour_id: { in: type_tour_id } } })

            const generateAndCondition = () => {
                const conditions = [];
                if (tag_id && tag_id?.length > 0) conditions.push({ id: { in: findTag.map(el => el.blog_id) } },)
                if (type_tour_id && type_tour_id?.length > 0) conditions.push({ id: { in: findTypeTour.map(el => el.blog_id) } },)
                if (user_id) conditions.push({ user_id },)
                return conditions
            }

            let data: any = await prisma.blog.findMany({
                where: {
                    OR: [
                        { title: { search: convertTsVector(keySearch) } },
                        { title: { mode: 'insensitive', contains: keySearch, } },
                        { content: { mode: 'insensitive', contains: keySearch, } },
                        { key_word: { mode: 'insensitive', contains: keySearch, } },
                    ],
                    AND: generateAndCondition()
                },
                include: {
                    // blog_tag: {
                    //     include: { tag: true }
                    // },
                    // blog_type_tour: {
                    //     include: { type_tour: true }
                    // },
                    image_blog: true,
                    user_info: {
                        select: {
                            name: true,
                            id: true,
                            avatar: true,
                        }
                    }
                },
                orderBy: [
                    { created_at: 'desc' }, // Sắp xếp theo cột created từ sớm nhất đến muộn nhất
                    // { created_at: 'desc' }, // Nếu muốn sắp xếp từ muộn nhất đến sớm nhất
                ],
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

            const dataResult = data?.map((el: any) => { return { ...el, content: "..." } })

            return successGetPage(dataResult, pageNumber, pageSize, countTotalData)
        } catch (error) {
            return errorCode(error.message)
        }
    };
}