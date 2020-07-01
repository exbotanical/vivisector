let target = document.documentElement;
let targetProxy = new Proxy(target,{
  get:(obj,key)=>{
    let value = Reflect.get(obj,key);
    if(typeof(value) == "function"){
      return value.bind(obj);
    }
    return value;
  }
});

targetProxy.addEventListener('click',()=>console.log('clicked'));