# jsxQuery

Save time maintaining and testing your JSP code by keeping things organized in small, manageable **components**. A component-based architecture makes it easy to write **automated tests** for your UI code, opening the door to [TDD](http://agiledata.org/essays/tdd.html). This could mean [40-90% fewer bugs](http:/f/research.microsoft.com/en-us/groups/ese/nagappan_tdd.pdf) by the end of your project.

### How does it work?

Normally, unit testing JSP code would be impossible. This is because your average JSP file is doing two jobs at once:

* fetching and manipulating data from the **server**
* visual presentation of that data in the **browser**

This tool lets you treat these two intertwined parts of your JSP code as **separate units**. (This works through [dependency injection](http://www.informit.com/articles/article.aspx?p=1946176&seqNum=2) and the [façade pattern](http://stackoverflow.com/questions/5242429/what-is-facade-design-pattern).) With better [separation of concerns](http://deviq.com/separation-of-concerns/), it becomes possible to do **unit tests** where previously only slow, complex integration tests would have worked.

### Huh?

Basically, this all boils down to keeping things in separate files, where you would normally have them all mixed together in one. The server-oriented half and the browser-oriented half remain separate up until your final [build step](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/chapter2.html#building-some-jsp-files):

```
$ npm run jsxquery-build
```

The end result is an ordinary JSP file like you're used to.

### So what's the point?

Since the end result is the same as writing raw JSTL, all the debugging skills your team has acquired during their past experience with JSPs are still applicable. But with all back-end logic cleanly separated out from the view logic, a new possibility opens up for you. Just take a file with your back-end logic and **swap it out for some test data**, and you can see what your page would look like with that data, **without even running a server or a database**. You can create as much test data as you like, so you can see what your page would look like under all sorts of different conditions. **No more clicking around**, filling out forms, and waiting for them to process over and over--just write some test data once, plug it in, and re-render your page as needed.

You can test your changes right in the browser by creating an HTML file, or you can set up automated tests like in [this demo](https://github.com/justinsilvestre/jsxquery-demo). In any case, as a front-end developer, you can **stop being blocked by unrelated back-end issues**, as long as you know the page and the page state relevant to whatever feature/bug you're working on. 

### Conventions your team already knows

As a front-end developer, all you need to learn in order to start using jsxQuery is the [API for creating `Component`s](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/chapter2.html). The back-end parts (and your test data) are simply JavaScript/JSON objects, and the front-end parts are made of JavaScript and [JSX](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/chapter1.html). Technically speaking, JSX is an extension to the syntax of JavaScript, but in practice, it's [hardly any different](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/jsx.html) from HTML/JSTL.

Even back-end developers with no experience with JavaScript will encounter little that's new to them in jsxQuery. The jsxQuery `Component` API only uses features of JavaScript with direct analogs in Java, like class and method definitions, which have nearly identical syntax in both languages. (If there is one exception, it's the `map()` method on JavaScript arrays, which you can just think of as [a replacement for forEach loops](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/chapter3.html#3-iterating-over-collections).

### Use only as much as you want

You don't have to overhaul your entire UI architecture to start using jsxQuery components. [`jsxquery-build`](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/chapter2.html#building-some-jsp-files) lets you stay in control of exactly which parts of your project depend on jsxQuery components. And since you end up with human-readable JSP files, you can safely remove jsxQuery from your project at any time.

### Training wheels for other component-based UI architectures

The jsxQuery component API mirrors a small subset of Facebook's [React](https://facebook.github.io/react/). React is at the forefront of a large movement in the JavaScript community centered on component-based UIs. That means learning how to write a jsxQuery component will leave you with skills that are also applicable in [Angular 2](https://angular.io/), [Polymer](https://www.polymer-project.org/1.0/), [vue.js](https://vuejs.org/), and even iOS/Android development with [React Native](https://facebook.github.io/react-native/).

### Experimental features

jsxQuery started as an experiment in automating the process of keeping markup and jQuery code in sync. You can see those features at work (at least the o nes that have been completed) at `index.html` in this repo.

## In-depth Walkthrough

If you want to learn more details, checkout this [walkthrough](https://justinsilvestre.gitbooks.io/unit-testing-in-atg/content/) and the accompanying [repo](https://github.com/justinsilvestre/jsxquery-demo) complete with example unit tests.

