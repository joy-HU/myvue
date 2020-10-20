class Vue{
	constructor(opts) {
	    this.opts = opts
		this._data = opts.data 
		this.obverse(this._data)
		this.compiler(opts.el)
	}
	obverse(data){
		let dep = {}
		this._data = new Proxy(data,{
			// target {message: 'helloworld'} key message
			// target[key] hello world
			get(target, key){
				if(!dep[key]){
					dep[key] = new Dep()
				}
				if(Dep.target){
					// dep[message] = watcher
					console.log(dep[key])
					dep[key].addSubs(Dep.target)
				}
				let res = Reflect.get(target, key)
				return res
			},
			set(target, key, newValue){
				dep[key].notify(newValue)
				return Reflect.set(target, key, newValue)
			}
		})
	}
	compiler(el){
		let app = document.querySelector(el)
		this.compilerNode(app)
	}
	compilerNode(el){
		let childs = el.childNodes
		childs.forEach(child => {
			if(child.nodeType === 3){
				let reg = /\s*\{\{([^\{\}]+)\s*\}\}/g
				let text = child.textContent
				if(reg.test(text)){
					let $1 = RegExp.$1.trim()
					child.textContent = text.replace(reg,this._data[$1])
					new Watcher(this._data, $1, newValue => {
						let reg = new RegExp(this._data[$1], 'g')
						child.textContent = child.textContent.replace(reg, newValue)
					})
				}
			}
		})
	}
}
// 收集依赖
class Dep{
	constructor() {
	    this.subs = []
	}
	addSubs(sub){
		this.subs.push(sub)
	}
	notify(value){
		this.subs.forEach(sub => {
			sub.update(value)
		})
		
	}
}
class Watcher{
	constructor(data, key, cb) {
	    Dep.target = this
		this.cb = cb
		// 执行get
		data[key]
		Dep.target = null
		
	}
	update(value){
		this.cb(value)
	}
}