export function getVisualizerConfig(problem) {
  const tags = problem?.tags || [];
  const name = (problem?.name || '').toLowerCase();
  if (tags.includes('sortings') || name.includes('sort'))
    return { type:'sorting',      label:'Sorting Visualizer' };
  if (tags.includes('graphs') || tags.includes('dfs and bfs'))
    return { type:'graph',        label:'Graph Traversal' };
  if (tags.includes('trees'))
    return { type:'tree',         label:'Tree Traversal' };
  if (tags.includes('binary search'))
    return { type:'binarysearch', label:'Binary Search' };
  if (tags.includes('dp'))
    return { type:'dp',           label:'DP Table' };
  if (tags.includes('two pointers'))
    return { type:'twopointers',  label:'Two Pointers' };
  if (tags.includes('strings'))
    return { type:'string',       label:'String Matching' };
  if (tags.includes('greedy'))
    return { type:'greedy',       label:'Greedy Steps' };
  return { type:'array', label:'Array Visualizer' };
}

export function generateInputFromProblem(problem) {
  const config = getVisualizerConfig(problem);
  const rating = problem?.rating || 1200;
  const size   = rating <= 1200 ? 8 : rating <= 1800 ? 10 : 14;
  switch (config.type) {
    case 'binarysearch':
    case 'twopointers':
      return Array.from({length:size}, (_,i) => (i+1) * (Math.floor(Math.random()*4)+2))
                  .sort((a,b) => a-b);
    default:
      return Array.from({length:size}, () => Math.floor(Math.random()*85)+10);
  }
}

export function* bubbleSortSteps(arr) {
  const a=[...arr], n=a.length;
  for (let i=0;i<n-1;i++) {
    for (let j=0;j<n-i-1;j++) {
      yield {array:[...a],comparing:[j,j+1],sorted:Array.from({length:i},(_,k)=>n-1-k)};
      if (a[j]>a[j+1]) [a[j],a[j+1]]=[a[j+1],a[j]];
    }
  }
  yield {array:[...a],comparing:[],sorted:Array.from({length:n},(_,k)=>k)};
}

export function* selectionSortSteps(arr) {
  const a=[...arr], n=a.length, done=[];
  for (let i=0;i<n-1;i++) {
    let m=i;
    for (let j=i+1;j<n;j++) {
      yield {array:[...a],comparing:[m,j],sorted:[...done]};
      if (a[j]<a[m]) m=j;
    }
    [a[i],a[m]]=[a[m],a[i]]; done.push(i);
  }
  yield {array:[...a],comparing:[],sorted:Array.from({length:n},(_,k)=>k)};
}

export function* insertionSortSteps(arr) {
  const a=[...arr], n=a.length;
  for (let i=1;i<n;i++) {
    let j=i;
    while (j>0) {
      yield {array:[...a],comparing:[j-1,j],sorted:Array.from({length:i},(_,k)=>k)};
      if (a[j]<a[j-1]) { [a[j],a[j-1]]=[a[j-1],a[j]]; j--; } else break;
    }
  }
  yield {array:[...a],comparing:[],sorted:Array.from({length:n},(_,k)=>k)};
}

export function* binarySearchSteps(arr,target) {
  let lo=0,hi=arr.length-1;
  while (lo<=hi) {
    const mid=Math.floor((lo+hi)/2);
    yield {array:arr,lo,hi,mid,found:false,target};
    if (arr[mid]===target) { yield {array:arr,lo,hi,mid,found:true,target}; return; }
    if (arr[mid]<target) lo=mid+1; else hi=mid-1;
  }
  yield {array:arr,lo:-1,hi:-1,mid:-1,found:false,target};
}

export function* twoPointersSteps(arr,target) {
  let lo=0,hi=arr.length-1;
  while (lo<hi) {
    const sum=arr[lo]+arr[hi];
    yield {array:arr,lo,hi,sum,target,found:sum===target};
    if (sum===target) return;
    if (sum<target) lo++; else hi--;
  }
}

export const COMPLEXITY = {
  bubble:       {time:'O(n²)',    space:'O(1)'},
  selection:    {time:'O(n²)',    space:'O(1)'},
  insertion:    {time:'O(n²)',    space:'O(1)'},
  binarysearch: {time:'O(log n)', space:'O(1)'},
  twopointers:  {time:'O(n)',     space:'O(1)'},
  dp:           {time:'O(n²)',    space:'O(n)'},
  graph:        {time:'O(V+E)',   space:'O(V)'},
};