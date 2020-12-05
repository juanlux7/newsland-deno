import { renderFileToString } from './deno_dependencies/dejs-0.8.0/mod.ts';
import { Post } from "./models/Post.ts";
import { db } from "./utils/db.ts";


// route for getting the main post page
export const dashboard = async (ctx: any) => {

    const postsTable = db.collection<any>("posts");

    const latestPosts = await postsTable.aggregate([
        { $sort: { head: -1, created_at: -1 } },
        { $limit: 9 }
    ]);

    const topPosts = await postsTable.aggregate([
        { $sort: { views: -1 } },
        { $limit: 4 }
    ]);


    ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/dashboard.ejs`, {
        user: ctx.state.currentUser,
        posts: latestPosts,
        topPosts: topPosts,
        title: "Breaking News of the World"
    });


}

export const article = async (ctx: any) => {

    try {

        const postsTable = db.collection<any>("posts");

        let post;

        // check if the id does have the right length
        if(ctx.params.articleId.length === 24) {

            post = await postsTable.findOne({ _id: { $oid: ctx.params.articleId } })
        
        } else {
            ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/error.ejs`, {
                user: ctx.state.currentUser,
                error: "The resource you are looking for does not exist",
            })
        }

        // a rudimentary view counter, it would be great if it counts for unique users only to avoid spamming f5
        await postsTable.updateOne(
            { _id: { $oid: ctx.params.articleId } },
            { $set: { views: post.views + 1 } });

        ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/article.ejs`, {
            user: ctx.state.currentUser,
            post: post,
            title: `${post.title}`
        });

    } catch(e) {

            ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/error.ejs`, {
                user: ctx.state.currentUser,
                error: "The resource you are looking for does not exist",
            })
        }


}

export const articlesByCategory = async (ctx: any) => {

    try {

        const postsTable = db.collection<any>("posts");

        const posts = await postsTable.find({ category: ctx.params.categoryName })

        if(posts.length === 0) {
            ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/error.ejs`, {
                user: ctx.state.currentUser,
                error: "Try a different category (science, technology, world, finance...)",
            })
        }

        ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/postsByCategory.ejs`, {
            user: ctx.state.currentUser,
            posts: posts,
            categoryName: ctx.params.categoryName,
            title: `${ctx.params.categoryName} articles`
        });
    
    } catch(e) {
        
        ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/error.ejs`, {
            user: ctx.state.currentUser,
            error: e,
        })
    }
}

export const contact = async (ctx: any) => {


    ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/contact.ejs`, {
        user: ctx.state.currentUser,
        title: "Contact Us"
    });
}

export const terms = async (ctx: any) => {


    ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/terms.ejs`, {
        user: ctx.state.currentUser
    });
}