// 使用自自执行函数创建全局 Query 对象
let $ = (S = (function (window) {
  /**
   * @function $
   * @description 获取目标 DOM 元素
   * @param { String } nodeSelector 查找目标元素字符串
   * @return { DOMObject } 返回 Query 对象信息
   * @author achens 2022-1-08 17:47
   * @version 0.1.1
   */
  function $(nodeSelector) {
    // 如果传入的是一个 DOM 标签，则直接调用 Query 返回 Query 对象
    if (typeof nodeSelector == "object" && nodeSelector.length == undefined) {
      return new Query(nodeSelector, null);
    }
    // 如果传入的是一个 NodeList 列表，也直接调用 Query 方法返回 Query 对象
    if (typeof nodeSelector == "object" && nodeSelector.length >= 1) {
      return new Query(nodeSelector, null);
    }
    // 判断传入的是否不是一个字符串
    if (typeof nodeSelector != "string")
      throw "请传入合法 selector 字符和 dom 对象！";
    // 获取目标元素
    let dom = document.querySelectorAll(nodeSelector);
    // 获取 DOM 元素集合
    return new Query(dom, nodeSelector);
  }

  /**
   * @function Query
   * @description 将 DOM 对象转换为 Query 对象并返回
   * @param { DOMObject } dom 目标 DOM 对象
   * @param { String } selector 查找的目标字符串
   * @return { Object } 当前 Query 对象信息
   * @author achens 2022-1-08 17：47
   * @version 0.3.0
   */
  function Query(dom, selector) {
    // 判断有无获取到 DOM，如果获取到了就保存获取到的 DOM 元素总长度
    this.length = dom ? dom.length : 0;
    // 如果 dom 是一个对象且没有长度（dom 是一个标签的情况下）
    // 解决 .parentNode 获取的父元素不是一个 NodeList，导致没有长度的 BUG
    if (typeof dom == "object" && dom.length == undefined) {
      // 手动设置长度为 1
      this.length = 1;
      // 设置第一项为传进来的 DOM 元素
      this[0] = dom;
      // 返回这个 Query 对象
      return this;
    }
    // 保存所有获取到的 DOM 元素到当前对象中
    for (let i = 0; i < this.length; i++) this[i] = dom[i];
    // 获取查找目标元素
    this.selector = selector || "";
    // 返回当前 DOM 对象的 Query 化对象
    return this;
  }

  // 基于 Query 对象封装对 DOM 操作的方法
  Query.prototype = {
    /**
     * @description 共用方法：遍历目标函数，并执行全部回调函数。
     * @param { Function } callBack 回调函数。
     */
    each(callBack) {
      /**
       * @description 在当前 DOM 对象中执行传进来的所有回调
       * @param { DOMObject } dom 当前 DOM 对象
       * @param { Number } index 当前 DOM 对象的索引
       */
      [].every.call(this, function (dom, index) {
        // 在 DOM 对象中执行回调
        callBack.call(dom, dom, index);
      });
    },

    /**
     * @description 判断事件是否合法
     * @param { String } on 事件类型
     * @param { func } func 回调函数
     */
    isEvent(on, func) {
      // 判断传入的事件类型是否基本合法
      if (on == undefined || typeof on != "string") {
        throw "事件类型不合法...";
      }
      // 判断传入的事件回调是否合法
      if (func == undefined || typeof func != "function") {
        throw "传入的事件回调不合法...";
      }
    },

    /**
     * @description 给当前 DOM 绑定事件类型
     * @param { String } on 事件类型
     * @param { Function } fun 回调函数
     * @param { Boolean } bool 定义事件传播冒泡还是捕获
     * @returns { DOMObject } 返回当前 Query 对象
     */
    on(on, func, bool) {
      // 获取当前 DOM 对象
      let dom = this[0];
      // 判断传入事件是否合法
      this.isEvent(on, func);
      // 判读昂当前浏览器是否支持 addEventListener
      if (addEventListener) {
        // 给当前 DOM 绑定事件
        dom.addEventListener(on, func, bool);
      } else {
        // 兼容 ie 事件绑定
        dom.attachEvent(on, func, bool);
      }
      return this;
    },

    /**
     * @description 给当前 DOM 一次性绑定多个事件类型
     * @param { Object | Array } eventObj 传入的事件对象或事件对象数组
     * @returns { DOMObject } 返回当前 Query 对象
     */
    bind(eventObj) {
      // 如果传入的参数是个字符串
      if (typeof eventObj == "string") throw "绑定单个事件请使用 .on() 方法";
      // 判断传入参数是否是一个数组
      if (eventObj instanceof Array) {
        // 使用 .forEach 对数组内的事件类型依次进行事件绑定
        eventObj.forEach((k) => {
          // 使用 on() 方法进行事件绑定
          this.on(k.on, k.func, k.bool);
        });
      } else if (eventObj instanceof Object) {
        // 使用解构拿到事件相关参数
        let { on, func, bool } = eventObj;
        // 并使用 on() 方法绑定事件类型
        this.on(on, func, bool);
      }
      return this;
    },

    /**
     * @description 获取或设置当前 DOM 的 CSS 样式
     * @param { String | Object | Array } style 传进来的 CSS 属性名或者属性对象
     * @returns { String | DOMObject } 返回获取到的 CSS 样式或当前 Query 对象
     */
    css(pattern) {
      // 拿到当前 DOM
      let dom = this[0];
      // 获取样式：只传入一个参数，且这个参数是字符串的情况下
      if (typeof pattern == "string" && arguments.length == 1) {
        // 返回当前样式值
        return getComputedStyle(dom).getPropertyValue(pattern);
      }
      // 同时设置多个样式：只传入一个参数，且这个参数是对象
      if (pattern instanceof Object && arguments.length == 1) {
        // 将对象中的参数键值对遍历出来
        for (let name in pattern) {
          // 保存样式名
          let key = name;
          // 声明获取字符串中大写正则表达式
          let reg = /[A-Z]/g;
          // 在样式名中查找是否有大写字母
          if (reg.test(key)) {
            // 将大写字母改为划线
            key = key.replace(/[A-Z]/g, function (match) {
              return "-" + match.toLowerCase();
            });
          }
          // 修改样式
          dom.style.setProperty(key, pattern[name]);
        }
        return this;
      }
      // 修改样式：传入两个参数，且第二个参数是字符串或者数字
      // 获取样式名和值
      let name = arguments[0],
        value = arguments[1],
        // 获取第二个传入的参数是否是字符串或者数字
        isArg = name == "string" || "number" ? true : false;
      if (arguments.length == 2 && isArg) {
        // 修改样式
        dom.style.setProperty(name, value);
        return this;
      }
    },

    /**
     * @description 获取或设置当前 DOM 的属性
     * @param { String | Object | Array } attribute 传进来的 CSS 属性名或者属性对象
     * @returns { String | DOMObject } 返回获取到的 DOM 属性或当前 Query 对象
     */
    attr(attribute) {
      // 拿到当前 DOM
      let dom = this[0];
      // 获取属性：只传入一个参数，且这个参数是字符串的情况下
      if (typeof attribute == "string" && arguments.length == 1) {
        // 返回当前属性值
        return dom.getAttribute(attribute);
      }
      // 同时设置多个属性：只传入一个参数，且这个参数是对象
      if (attribute instanceof Object && arguments.length == 1) {
        // 将对象中的参数键值对便利出来
        for (let name in attribute) {
          // 修改样式
          dom.setAttribute(name, attribute[name]);
        }
        return this;
      }
      // 修改属性：传入两个参数，且第二个参数是字符串或者数字
      // 获取样式名和值
      let name = arguments[0],
        value = arguments[1],
        // 获取第二个传入的参数是否是字符串或者数字
        isArg = name == "string" || "number" ? true : false;
      if (arguments.length == 2 && isArg) {
        // 修改属性
        dom.setAttribute(name, value);
        return this;
      }
    },

    /**
     * @description 获取或修改元素的文本值
     * @param { Any } text 传入的文本值
     * @returns { Any | DOMObject } 获取到的文本值或 Query 对象
     */
    text(text) {
      // 拿到当前 DOM
      let dom = this[0];
      // 判断有无传入参数
      if (arguments.length >= 1) {
        // 修改文本值
        dom.innerText = text;
        return this;
      } else {
        // 返回当前文本值
        return dom.innerText;
      }
    },

    /**
     * @description 获取或修改元素的内容
     * @param { String } value 传入的字符串
     * @returns { String | DOMObject } 获取到的 DOM 元素内容或 Query 对象
     */
    html(value) {
      // 拿到当前 DOM
      let dom = this[0];
      // 判断有无传入参数
      if (arguments.length >= 1) {
        // 修改 DOM 内容
        dom.innerHTML = value;
        return this;
      } else {
        // 返回当前 DOM 内容
        return dom.innerHTML;
      }
    },

    /**
     * @description 获取、修改类名
     * @param { String } taxon 类名
     * @returns { String | DOMObject } 返回当前元素的类名或修改后的类名
     */
    class(taxon) {
      // 获取当前 DOM
      let dom = this[0];
      // 没有传入参数就将元素本身的类名返回出去
      if (taxon == undefined) {
        return dom.className;
        // 如果传入了参数，并且这个参数还是字符串
      } else if (taxon != undefined && typeof taxon == "string") {
        // 修改当前元素的类名并将当前 Query 对象返回
        dom.className = taxon;
        return this;
      }
    },

    /**
     * @description 添加类名
     * @param { String | Array } taxon 要添加的类名
     * @returns { DOMObject } 返回当前 Query 对象
     */
    addClass(taxon) {
      // 获取当前 DOM
      let dom = this[0];
      // 没有传入参数主动抛出错误
      if (arguments.length <= 0) throw "请传入要添加的类名";
      // 只传入一个类名，且不是以数组形式传入的，那就直接将这个类名添加进当前元素并返回
      if (arguments.length == 1 && typeof taxon == "string") {
        dom.classList.add(taxon);
        return this;
      }
      // 将参数集合转为为数组类型
      let arg = Array.from(arguments);
      // 使用 .map() 方法将数组中的每一项遍历出来并一一加入当前 DOM 中
      arg.map((v) => {
        if (typeof v == "string") {
          // 添加类名
          dom.classList.add(v);
        } else if (v instanceof Array) {
          // 将数组中的类名遍历出来加入当前 DOM 中
          for (let className of v) {
            dom.classList.add(className);
          }
        }
      });
      return this;
    },

    /**
     * @description 删除类名
     * @param { String } taxon 要删除的类名
     * @returns { DOMObject } 返回切换后的 Query 对象
     */
    delClass(taxon) {
      // 获取当前 DOM
      let dom = this[0];
      // 没有传入参数删除所有类名
      if (arguments.length <= 0) {
        dom.className = "";
        return this;
      }
      // 只传入了一个类名
      if (arguments.length == 1 && typeof taxon == "string") {
        // 直接删除这个类名
        dom.classList.remove(taxon);
        return this;
      }
      // 将参数集合转为为数组类型
      let arg = Array.from(arguments);
      // 使用 .map() 方法将数组中的每一项遍历出来并一一删除
      arg.map((v) => {
        if (typeof v == "string") {
          // 添加类名
          dom.classList.remove(v);
        } else if (v instanceof Array) {
          // 将数组中的类名遍历出来加入当前 DOM 中
          for (let className of v) {
            dom.classList.remove(className);
          }
        }
      });
      return this;
    },

    /**
     * @description 切换类名
     * @param { String } taxon 进行切换的类名
     * @returns { DOMObject } 返回切换后的 Query 对象
     */
    toggle(taxon) {
      // 获取当前 DOM
      let dom = this[0];
      // 如果没传入参数或参数类型不是字符串就主动抛出错误
      if (arguments.length <= 0) {
        throw "请传入参数！";
      } else if (typeof arguments[0] != "string") {
        throw "仅支持字符串类型的参数！";
      }
      // 进行类名切换
      dom.classList.toggle(taxon);
      return this;
    },

    /**
     * @description 获取父元素
     * @param { Number | String } selector 获取几层父元素；获取准确父元素
     * @returns { Object } 返回获取到的父元素 Query 对象
     */
    parent(selector) {
      // 获取当前 DOM
      let dom = this[0];
      // 传入了参数，且这个参数是 number 的情况下
      if (
        selector != undefined &&
        typeof arguments[0] == "number" &&
        selector > 1
      ) {
        // 保存自身
        let domParent = dom;
        // 遍历取父元素
        for (let i = 0; i < selector; i++) {
          // 判断是否已经获取到了最顶层的 document 对象
          if (domParent == document) return domParent;
          // 拿到当前元素的父元素
          domParent = domParent.parentNode;
        }
        // 将获取到的父元素返回
        return new Query(domParent, null);
        // 传入了参数且这个参数是一个字符串的情况下
      } else if (selector != undefined && typeof selector == "string") {
        // 获取当前元素的祖先元素，然后在祖先元素中查找准确父元素
        let selectorParent = dom.parentNode.parentNode.querySelector(selector);
        // 将获取到的父元素全部返回出去
        return new Query(selectorParent, selector);
      }
      // 没有传入参数就直接返回当前元素的父元素
      return new Query(dom.parentNode, null);
    },

    /**
     * @description 获取所有父级元素
     * @returns { Object } 返回获取到的所有父级元素
     */
    parentAll() {
      // 获取当前 DOM
      let dom = this[0];
      // 保存获取到的父级元素集合
      let parentArr = [];
      // 使用 while 循环获取父级元素
      while (dom.parentNode != document) {
        // 在没获取到 document 文档对象之前一直获取父级元素，并添加到数组当中
        dom = dom.parentNode;
        parentArr.push(dom);
      }
      return new Query(parentArr, null);
    },

    /**
     * @description 获取子元素
     * @param { String | Number } selector 获取指定子元素
     * @returns { Object } 返回获取到的子元素 Query 对象
     */
    children(selector) {
      // 获取当前 DOM
      let dom = this[0];
      // 判断是否传入了目标字符串
      if (selector != undefined && typeof selector == "string") {
        // 获取指定类型子元素
        let domChild = dom.querySelectorAll(selector);
        return new Query(domChild, selector);
        // 判断传入的参数是否是一个数字
      } else if (selector != undefined && typeof selector == "number") {
        // 先拿到所有子元素
        let domChild = Array.from(dom.children);
        // 使用 .filter() 从所有子元素中拿到想要的那个子元素
        domChild = domChild.filter((v, i) => i == selector);
        // 如果没有获取到子元素
        if (domChild.length == 0) throw "目标子元素不存在...";
        return new Query(domChild, selector);
      }
      // 没有传入参数就将所有子元素全部返回出去
      return new Query(dom.children, null);
    },

    /**
     * @description 在子元素的最前面插入元素
     * @param { DOMObject | String | number } node 需要插入的节点
     * @returns { Object | String | Number } 返回插入的新元素的 Query 对象或插入的内容
     */
    addFirstChild(node = null) {
      if (node == null) throw "请传入要插入的元素...";
      // 获取当前 DOM
      let dom = this[0];
      // 如果传入的是一个字符串或者数字
      if (typeof node == "string" || typeof node == "number") {
        // 创建一个 p 标签
        let p = document.createElement("p");
        // 将传入字符串或数字放入这个标签中
        p.innerHTML = node;
        // 然后将这个标签插入到第一个子元素之前
        dom.insertBefore(p, dom.firstChild);
        return new Query(p, null);
        // 如果传入的是一个元素
      } else if (typeof node == "object" && node.nodeType) {
        // 将这个元素插入到当前元素的子元素中的第一位;
        let newDom = dom.insertBefore(node, dom.firstChild);
        return new Query(newDom, null);
      }
    },

    /**
     * @description 在子元素的最后插入元素
     * @param { DOMObject | String | number } node 需要插入的节点
     * @returns { Object | String | Number } 返回插入的新元素的 Query 对象或插入的内容
     */
    addLastChild(node = null) {
      if (node == null) throw "请传入要插入的元素...";
      // 获取当前 DOM
      let dom = this[0];
      // 如果传入的 node 是一个字符串或者数字
      if (typeof node == "string" || typeof node == "number") {
        // 创建一个 p 标签
        let p = document.createElement("p");
        // 将传入字符串或数字放入这个标签中
        p.innerHTML = node;
        // 然后将这个标签插入到 DOM 中
        dom.appendChild(p);
        return new Query(p, null);
        // 传入的 node 是一个对象且有 nodeType 属性，那就代表其是一个元素
      } else if (typeof node == "object" && node.nodeType) {
        // 将这个元素插入到当前元素的子元素中的最后一位;
        let newDom = dom.appendChild(node);
        return new Query(newDom, null);
      }
    },

    /**
     * @description 在指定索引处插入子元素
     * @param { number } i 索引值
     * @param { DOMObject | String | number } node 需要插入的节点
     * @param { Boolean } 在元素的前面还是后面插；true： 前面；false：后面；默认 false；
     * @returns { Boolean } 返回插入的结果
     */
    insertChild(i, node, isBefore = false) {
      // 判断传入参数是否不合法
      if (
        typeof node != "string" &&
        typeof node != "number" &&
        typeof node != "object" &&
        typeof isBefore != "boolean" &&
        i < 0
      ) {
        throw "发生错误...";
      }
      // 获取当前 DOM
      let dom = this[0];
      // 判断是否是在元素的最前面插入，是的话直接调用 this.addFirstChild
      if (i <= 0 && isBefore == true) {
        return this.addFirstChild(node);
        // 判断是否是在元素的最后面插入，是的话直接调用 this.addLastChild
      } else if (i >= dom.children.length && isBefore == false) {
        return this.addLastChild(node);
      }
      // 判断是在元素前面还是在后面插入
      if (isBefore) {
        // 判断插入的内容是否是字符串或者数字
        if (typeof node == "string" || typeof node == "number") {
          // 创建一个 p 标签
          let p = document.createElement("p");
          // 设置内容为传入的字符串或数字
          p.innerHTML = node;
          // 最后将其插入到 DOM 中
          dom.insertBefore(p, dom.children[i]);
          return new Query(p, null);
          // 判断插入的是否是一个节点
        } else if (typeof node == "object" && node.nodeType) {
          // 直接将其插入到对应位置上
          dom.insertBefore(node, dom.children[i]);
          return new Query(node, null);
        }
      } else {
        // 获取目标子元素的下一个兄弟元素
        let nextDom = dom.children[i].nextElementSibling;
        // 判断插入的内容是否是字符串或者数字
        if (typeof node == "string" || typeof node == "number") {
          // 创建一个 p 标签
          let p = document.createElement("p");
          // 将传入内容设置为这个标签的内容
          p.innerHTML = node;
          // 然后将这个标签插入到 DOM 中
          dom.insertBefore(p, nextDom);
          return new Query(node, null);
          // 判断插入的是否是一个节点
        } else if (typeof node == "object" && node.nodeType) {
          // 直接插入到 DOM 中
          dom.insertBefore(node, nextDom);
          return new Query(node, null);
        }
      }
    },

    /**
     * @description 删除子元素
     * @param { Number | String } index 目标子元素的索引或 css 选择符
     */
    removeChild(index) {
      // 获取当前元素
      let dom = this[0];
      // 判断传入的是否是索引
      if (typeof index == "number") {
        dom.removeChild[index];
        // 另外一种实现方法
        // // 删除目标索引子元素
        // dom.children[index].remove();
        return new Query(dom, null);
        // 判断传入的是否是字符串
      } else if (typeof index == "string") {
        // 获取要删除的目标元素
        let indexDom = dom.querySelectorAll(index);
        // 遍历删除
        for (let i = 0; i < indexDom.length; i++) {
          indexDom[i].remove();
        }
        return new Query(dom, null);
        // 如果没有传入参数
      } else if (index == undefined) {
        // 获取子元素长度
        let childLength = dom.children.length;
        // 遍历子元素长度来删除所有子元素
        for (let i = 0; i < childLength; i++) {
          // 因为是一个个删除的，所以子元素是一直在变化的
          // 这里只需要一直删除第一个就可
          dom.children[0].remove();
        }
        return new Query(dom, null);
      }
      throw "只接受数字以及字符串！";
    },

    /**
     * @description 获取第一个子元素
     * @returns { Object } 返回获取到的 DOM 的 Query 对象
     */
    firstChild() {
      // 获取当前 DOM
      let dom = this[0];
      // 获取第一个子元素
      let firstDom = dom.children[0];
      return new Query(firstDom, null);
    },

    /**
     * @description 获取最后一个子元素
     * @returns { Object } 返回获取到的 DOM 的 Query 对象
     */
    lastChild() {
      // 获取当前 DOM
      let dom = this[0];
      // 获取 子元素长度
      let len = dom.children.length;
      // 获取最后个子元素
      let lastDom = dom.children[len - 1];
      return new Query(lastDom, null);
    },

    /**
     * @description 获取准确子元素
     * @param { Number } i 准确子元素的索引
     * @returns { Object } 返回获取到的 DOM 的 Query 对象
     */
    child(i) {
      // 获取当前 DOM
      let dom = this[0];
      // 获取 子元素长度
      let len = dom.children.length;
      // 判断传入索引是否合法
      if (typeof i == "number" && i >= 0) {
        // 获取准确子元素
        let lastDom = dom.children[i];
        return new Query(lastDom, null);
      }
      throw "传入索引不合法！";
    },

    /**
     * @description 获取 Query 对象元素中的第一个元素
     * @returns { Object } 返回获取到的 Query 对象
     */
    first() {
      return new Query(this[0], null);
    },

    /**
     * @description 获取 Query 对象元素中的最后一个元素
     * @returns { Object } 返回获取到的 Query 对象
     */
    last() {
      return new Query(this[this.length - 1], null);
    },

    /**
     * @description 通过索引获取准确的 Query 对象列表中的某个元素
     * @param { Number } i
     * @returns { Object } 返回获取到的 Query 对象
     */
    eq(i) {
      // 判断传入索引是否合法
      if (typeof i == "number" && i >= 0) {
        // 获取准确 Query 元素
        return new Query(this[i], null);
      }
      throw "传入索引不合法！";
    },

    /**
     * @description 获取上一个同级节点或指定的同级节点
     * @param { Number } i 转入的索引值
     * @returns { Object }  返回获取到的 DOM 的 Query 对象
     */
    prevNode(i) {
      // 获取当前 DOM
      let dom = this[0];
      // 判断有无传入参数
      if (i == undefined || i == false || i <= 0) {
        // 获取上一个兄弟元素
        let prevDom = dom.previousElementSibling;
        return new Query(prevDom, null);
      }
      // 保存兄弟元素
      let prevDom = dom.previousElementSibling;
      for (let j = 0; j < i; j++) {
        // 获取上一个兄弟元素
        prevDom = prevDom.previousElementSibling;
      }
      return new Query(prevDom, null);
    },

    /**
     * @description 获取上一个同级节点或指定的同级节点
     * @param { String } 通过 CSS 选择器准确获取需要的兄弟元素
     * @returns { Array }  返回获取到的所有兄弟元素
     */
    prevNodeAll(selector) {
      // 获取到当前 DOM
      let dom = this[0];
      // 先获取所有的上一个兄弟元素
      // 获取上一个兄弟元素
      let prevDom = dom.previousElementSibling;
      // 保存获取到的兄弟元素
      let prevDomArr = [];
      // 不断循环获取
      while (prevDom != document && prevDom != null) {
        // 将获取到的兄弟元素放入数组中
        prevDomArr.push(prevDom);
        // 继续获取上一个兄弟元素
        prevDom = prevDom.previousElementSibling;
      }
      // 判断是否需要准确获取兄弟元素
      if (
        typeof selector == "string" &&
        selector != undefined &&
        selector != false
      ) {
        // 获取筛选条件；获取 CSS 查找器的第一位
        let index = selector.slice(0, 1);
        // 通过 switch 判断筛选目标是什么
        switch (index) {
          case ".":
            // 通过 class 择选兄弟元素
            // 使用 filter 进行过滤，获取到目标兄弟元素
            var domArr = prevDomArr.filter(
              (v) =>
                // 将类名列表转为数组并只判断第一个类名是否是我们要获取的准确兄弟元素 CSS 查询器
                v.classList.value.split(" ")[0] ==
                selector.slice(1, selector.length)
            );
            return new Query(domArr, null);
          case "#":
            // 通过 id 择选兄弟元素
            var domArr = prevDomArr.filter(
              // 只需要 id 相同的兄弟元素
              (v) => v.id == selector.slice(1, selector.length)
            );
            return new Query(domArr, null);
          default:
            var domArr = prevDomArr.filter(
              // 通过 .nodeName 来获取标签名称筛选合法兄弟元素
              // 因为 .nodeName 获取的名称都是大写，所以需要使用 .toUpperCase() 转为大写在进行判断
              (v) => v.nodeName === selector.toUpperCase()
            );
            return new Query(domArr, null);
        }
      }
      // 如果不需要获取准确兄弟元素就直接将所有兄弟元素全部返回
      return prevDomArr;
    },

    /**
     * @description 获取下一个同级节点或指定的同级节点
     * @param { Number } i 转入的索引值
     * @returns { Object }  返回获取到的 DOM 的 Query 对象
     */
    nextNode(i) {
      // 获取当前 DOM
      let dom = this[0];
      // 判断有无传入参数
      if (i == undefined || i == false || i == 0) {
        // 获取下一个兄弟元素
        let nextDom = dom.nextElementSibling;
        return new Query(nextDom, null);
      }
      // 保存兄弟元素
      let nextDom = dom.nextElementSibling;
      for (let j = 0; j < i; j++) {
        // 获取下一个兄弟元素
        nextDom = nextDom.nextElementSibling;
      }
      return new Query(nextDom, null);
    },

    /**
     * @description 获取当前元素之后的所有同级节点
     * @param { String } 通过 CSS 选择器准确获取需要的兄弟元素
     * @returns { Object } 返回获取到的兄弟元素
     */
    nextNodeAll(selector) {
      // 获取到当前 DOM
      let dom = this[0];
      // 先获取全部兄弟元素
      // 获取上一个兄弟元素
      let nextDom = dom.nextElementSibling;
      // 保存获取到的兄弟元素
      let nextDomArr = [];
      // 不断循环获取
      while (nextDom != document && nextDom != null) {
        // 将获取到的兄弟元素放入数组中
        nextDomArr.push(nextDom);
        // 继续获取上一个兄弟元素
        nextDom = nextDom.nextElementSibling;
      }
      // 判断是否需要准确获取兄弟元素
      if (
        typeof selector == "string" &&
        selector != undefined &&
        selector != false
      ) {
        // 获取筛选条件；获取 CSS 查找器的第一位
        let index = selector.slice(0, 1);
        // 通过 switch 判断筛选目标是什么
        switch (index) {
          case ".":
            // 通过 class 择选兄弟元素
            // 使用 filter 进行过滤，获取到目标兄弟元素
            var domArr = nextDomArr.filter(
              (v) =>
                // 将类名列表转为数组并只判断第一个类名是否是我们要获取的准确兄弟元素 CSS 查询器
                v.classList.value.split(" ")[0] ==
                selector.slice(1, selector.length)
            );
            return new Query(domArr, null);
          case "#":
            // 通过 id 择选兄弟元素
            var domArr = nextDomArr.filter(
              // 只需要 id 相同的兄弟元素
              (v) => v.id == selector.slice(1, selector.length)
            );
            return new Query(domArr, null);
          default:
            var domArr = nextDomArr.filter(
              // 通过 .nodeName 来获取标签名称筛选合法兄弟元素
              // 因为 .nodeName 获取的名称都是大写，所以需要使用 .toUpperCase() 转为大写在进行判断
              (v) => v.nodeName === selector.toUpperCase()
            );
            return new Query(domArr, null);
        }
      } else {
        // 如果不需要获取准确兄弟元素就直接返回全部兄弟元素
        return nextDomArr;
      }
    },

    /**
     * @description 在元素自身的前面插入元素
     * @param { String | node | number } node 传入的节点或者字符串
     * @returns 返回被插入的元素 Query 对象
     */
    insertElementBefore(node) {
      // 获取当前 DOM
      let dom = this[0];
      // 获取父元素
      let parentDom = dom.parentNode;
      // 判断传入是否是一个节点
      if (typeof node == "object" && node.nodeType) {
        // 在当前元素之前插入元素
        parentDom.insertBefore(node, dom);
        return new Query(node, null);
      }
      if (typeof node == "string" || typeof node == "number") {
        // 创建一个元素
        let p = document.createElement("p");
        // 设置新元素内容为传入的内容
        p.innerHTML = node;
        // 插入元素
        parentDom.insertBefore(p, dom);
        return new Query(p, null);
      }
      throw "使用不规范！";
    },

    /**
     * @descriptions 在元素自身的后面插入元素
     * @param { String | node | number } node 传入的节点或者字符串
     * @returns 返回被插入的元素 Query 对象
     */
    insertElementAfter(node) {
      // 获取当前 DOM
      let dom = this[0];
      // 获取当前元素的下个元素
      let nextDom = dom.nextElementSibling;
      // 获取当前元素的父元素
      let parentDom = dom.parentNode;
      // 判断传入的是否是一个元素
      if (typeof node == "object" && node.nodeType) {
        // 插入元素
        parentDom.insertBefore(node, nextDom);
        return new Query(node, null);
      }
      // 判断传入的是否是一个字符串或者数字
      if (typeof node == "string" || typeof node == "number") {
        // 创建一个新元素
        let p = document.createElement("p");
        // 设置新元素内容为传入的内容
        p.innerHTML = node;
        // 插入元素
        parentDom.insertBefore(p, nextDom);
        return new Query(p, null);
      }
      throw "使用不规范！";
    },

    /**
     * @description 将当前 Query 对象转为 DOM 对象
     * @returns { DOMObject } 返回转换好的 DOM 对象
     */
    dom() {
      // 判断当前对象是否不是一个 Query 对象
      if (!this instanceof Query) throw "非 Query 对象！";
      // 判断当前 DOM 元素是否有多个
      if (this.length >= 2) {
        // 存放 DOM 元素集合
        let domSet = [];
        // 将所有 DOM 元素依次放入数组中
        for (let i = 0; i < this.length; i++) {
          domSet.push(this[i]);
        }
        // 最后将这个 DOM 数组返回
        return domSet;
      }
      // 返回 DOM 对象
      return this[0];
    },
  };

  /**
   * @description 全局方法：判断目标是否是一个 Query 对象
   * @return { Boolean } True & False
   */
  $.isQuery = function (value) {
    return value instanceof Query;
  };

  /**
   * @description 全局方法：将 Query 中的所有元素执行传入的内部 DOM 方法
   * @param { Object } Querys 要操作的目标 Query 对象合集
   * @param { String } func 需要执行的内部方法
   * @param { String | Number | Object } arg 传给该函数的参数
   */
  $.forQuery = function (Querys, func, ...arg) {
    // 保存备操作过的 dom
    let dom = [];
    console.log(Querys.__proto__);
    // 判断传入方法是否存在
    if (Querys.__proto__.hasOwnProperty(func)) {
      // 使用 switch 进行方法校准
      switch (func) {
        case "on":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.on(...arg));
          }
          break;
        case "bind":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.bind(...arg));
          }
          break;
        case "css":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.css(...arg));
          }
          break;
        case "attr":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.attr(...arg));
          }
          break;
        case "text":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.text(...arg));
          }
          break;
        case "html":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.html(...arg));
          }
          break;
        case "class":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.class(...arg));
          }
          break;
        case "addClass":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.addClass(...arg));
          }
          break;
        case "delClass":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.delClass(...arg));
          }
          break;
        case "toggle":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.toggle(...arg));
          }
          break;
        case "addFirstChild":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.addFirstChild(...arg));
          }
          break;
        case "addLastChild":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.addLastChild(...arg));
          }
          break;
        case "insertChild":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.insertChild(...arg));
          }
          break;
        case "removeChild":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.removeChild(...arg));
          }
          break;
        case "parent":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.parent(...arg));
          }
          break;
        case "parentAll":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.parentAll(...arg));
          }
          break;
        case "children":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.children(...arg));
          }
          break;
        case "firstChild":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.firstChild(...arg));
          }
          break;
        case "lastChild":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.lastChild(...arg));
          }
          break;
        case "first":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.first(...arg));
          }
          break;
        case "last":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.last(...arg));
          }
          break;
        case "eq":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.eq(...arg));
          }
          break;
        case "prevNode":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.prevNode(...arg));
          }
          break;
        case "prevNodeAll":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.prevNodeAll(...arg));
          }
          break;
        case "nextNode":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.nextNode(...arg));
          }
          break;
        case "nextNodeAll":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.nextNodeAll(...arg));
          }
          break;
        case "insertElementBefore":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.insertElementBefore(...arg));
          }
          break;
        case "insertElementAfter":
          // 依次对获取到的所有 Query 对象元素进行操作
          for (let i = 0; i < Querys.length; i++) {
            // 获取每个 dom
            let thisDom = new Query(Querys[i], null);
            // 保存被操作过的元素
            dom.push(thisDom.insertElementAfter(...arg));
          }
          break;
        default:
          throw "方法不存在！";
      }
    }
    // 返回统一执行结果
    return dom == [] ? "Error：出现意外错误!" : dom;
  };

  // 返回查找到的 DOM 元素集合
  return $;
})(window));
