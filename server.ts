import { Application, Router, send, isHttpError, Status } from "https://deno.land/x/oak@v6.3.2/mod.ts";
import { home, login, register, postRegister, postLogin, logout } from "./authRoutes.ts";
import { dashboard, article, articlesByCategory, contact, terms } from "./postRoutes.ts";
import routeMiddleware from "./middlewares/routeMiddleware.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts";
import { renderFileToString } from './deno_dependencies/dejs-0.8.0/mod.ts';
import { parse } from "https://deno.land/std@0.59.0/flags/mod.ts";

const app = new Application();
const router = new Router();


const DEFAULT_PORT = 8000;
const argPort = parse(Deno.args).port;
const port = argPort ? parseInt(argPort) : DEFAULT_PORT;

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (isHttpError(err)) {
      switch (err.status) {
        case Status.NotFound:
          // handle NotFound
          ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/error.ejs`, {
            user: ctx.state.currentUser,
            error: "Page Not Found"
          });
          break;
        
        default:
        // handle other statuses
      }
    } else {
      ctx.response.body = await renderFileToString(`${Deno.cwd()}/views/error.ejs`, {
        user: ctx.state.currentUser,
        error: "Something went wrong"
      });
      
    }
  }
});

app.use(routeMiddleware);


router
  .get('/', dashboard)
  .get('/home', home)
  .get('/login', login)
  .get('/logout', logout)
  .get('/register', register)
  .post('/register', postRegister)
  .post('/login', postLogin)
  .get('/article/:articleId', article)
  .get('/articles/:categoryName', articlesByCategory)
  .get('/contact', contact)
  .get('/terms', terms)

app.use(router.routes())
app.use(router.allowedMethods());



// setting the public static folder
app.use(async (context) => {
  await send(context, context.request.url.pathname, {
    root: Deno.cwd() + '/static',
  });
});


app.listen({ port: port });

console.log(`server running on port ${port}`);