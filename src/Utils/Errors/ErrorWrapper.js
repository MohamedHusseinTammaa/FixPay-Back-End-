export const asyncWrapper = (fn)=>{
    return async (req,res,next)=>{
        try{
            if(typeof fn !== "function") {
                throw new Error("Provided argument is not a function");
            }
            await fn(req,res,next);
        }
        catch(err){
            next(err);
        }
    }
}