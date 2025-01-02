export const tree = () =>  ({
  isRoot: true,
  kids: {},
  data: null,
})

export type Root = ReturnType<typeof tree>

export const char = (c: string, data?: any) => ({
  count: 0,
  ends: 0,
  char: c,
  kids: {} as Record<string, ReturnType<typeof char>>,
  isRoot: false,
  data,
  parent: null,
  get isLeaf () {
    return Object.keys(this.kids).length === 0
  },
  prefix: ''
})

export type BranchItem = ReturnType<typeof char>

export type Node = ReturnType<typeof tree> | ReturnType<typeof char>

export const addToNode = (node: Node) => (c: string) => {
  node.kids[c] ||= char(c)
  node.kids[c].count += 1
  node.kids[c].parent = node
  node.kids[c].prefix = (node?.prefix || '') + (node?.char || '')

  return node.kids[c]
}

// export const getNextNode = (node: Node) => (c: string) => {
//   node.kids[c] ||= char(c)
//   return node.kids[c]
// }

export const traverseUp = function* (nodes: Node[]) {
  nodes = nodes.flat()
  // console.log('TRAVERSE UP NODES', nodes)
  for (let cur of nodes) {
    if (cur && !cur.isRoot) {
      // console.log('TRAVERSE UP CUR', cur)
      
        yield cur
        if (cur.parent) {
          yield* traverseUp([cur.parent].flat()) 
      }
    }
  }
}

export const collectPrefix = (node: Node) => {
  let str = ''
  for (let cur of traverseUp([node])) {
    // console.log('COLLECT PREFIX CUR', cur)
    if (!cur.isRoot) {
      str += cur.char
    }
  }

  return str.split('').reverse().join('')
}


export const traverse = function* (nodes: Node[]) {
  for (let cur of nodes) {
    yield cur
    yield* traverse(Object.values(cur.kids)) 
  }
}

export const getEndingNode = (node: Node) => (chars: string) => {
  let cur = node

  for (let [i, letter] of chars.split('').entries()) {
    cur = addToNode(cur)(letter)
  }

  return cur
}

export const nodes = (node: Node) => function* (chars: string)  {
  let cur = node

  let result: Node[] = []

  for (let [i, letter] of chars.split('').entries()) {
    cur = addToNode(cur)(letter)
    yield cur
    result.push(cur)
  }

  return result
}

export const insert = (node: Node) => (chars, dataFn?: (node?: Node) => any) => {
  let cur = node

  for (let [i, letter] of chars.split('').entries()) {
    const isLast = i == chars.length - 1

    cur = addToNode(cur)(letter)

    if (!cur?.data) {
      cur.data = dataFn?.(cur)
    }

    if (isLast) {
      cur.ends += 1
      cur.data = dataFn?.(cur)
    }
  }

  return cur
}

export const inspect = (startNode: Node) => (node: Node = startNode, prefix = '', isLast = true) => {
  let result = prefix

  if (isLast) {
    result += node?.isRoot ? "Root\n" : `└─ ${(node as unknown as ReturnType<typeof char>).char} (${(node as unknown as ReturnType<typeof char>).count}) (${node.ends})\n`
    prefix += "   "
  } else {
    result += node?.isRoot ? "├─ Root\n" : `├─ ${(node as unknown as ReturnType<typeof char>).char} (${(node as unknown as ReturnType<typeof char>).count}) (${node.ends})\n`
    prefix += "│  "
  }

  const kids = Object.values(node.kids)
  kids.forEach((child, index) => {
    result += inspect(child)(child, prefix, index === kids.length - 1)
  })

  return result
}


export const prefixChains = (node: Node, acc: ReturnType<typeof char>[] = []) => {
  const isRoot = !!node?.isRoot;
  const isntRoot = !isRoot
 
  // console.log('NODE', node, node.kids)
  const curKids = Object.values(node.kids)
  
  if (isRoot) {
    return curKids.map(kid => prefixChains(kid,[...acc, kid])).map(a => ({prefix:a.map(x => x.char).join(''), data: a.map(x => x.data).flat(), count: a.map(x => x.count), ends: a.map(x => x.ends)}))  
  }
  
  if (isntRoot) {
      if (curKids.length == 1) {
        return prefixChains(curKids[0], [...acc, curKids[0]])
      } else {
        return acc
      }
  }
}


export const createPrefixTree = () => {
  const root = tree()

  const bound = {
    root,
    insert: insert(root),
    inspect: inspect(root),
    prefixChains: (node: Node = root) => prefixChains(node),
    getEndingNode: getEndingNode(root),
    addToNode: addToNode(root),
    nodes: nodes(root),
    traverse: function* (nodes: Node[] = [root]) {
      yield* traverse(nodes)
    },
    traverseUp: function* (nodes: Node[] = [root]) {
      yield* traverseUp([nodes].flat())
    },
    collectPrefix,

    tree,
    char,
  }

  return { free:{
    root,
    insert,
    inspect,
    prefixChains,
    getEndingNode,
    addToNode,
    nodes,
    tree,
    char,
    traverse,
    collectPrefix,
    traverseUp,
  },
  bound
  }
}


