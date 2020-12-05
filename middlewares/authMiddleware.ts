
const authMiddleware = async (ctx: any, next: Function) => {

  if(!ctx.state.currentUser) {
    ctx.response.redirect('/login');
  } else {
    await next();
  }

}

export { authMiddleware };