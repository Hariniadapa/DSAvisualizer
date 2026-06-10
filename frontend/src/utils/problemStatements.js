const POPULAR_PROBLEMS = {
  '4-A': {
    description: "One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one, in their opinion. After that the watermelon was weighed, and the scales showed w kilos. They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.\n\nPete and Billy are great fans of even numbers, that's why they want to divide the watermelon in such a way that each of the two parts weighs even number of kilos, at the same time it is not obligatory that the parts are equal. The boys are extremely tired and want to start their meal as soon as possible, that's why you should help them and find out, if they can divide the watermelon in the way they want. For sure, each part should have a positive weight.",
    inputFormat: "The first (and the only) input line contains integer number w (1 ≤ w ≤ 100) — the weight of the watermelon bought by the boys.",
    outputFormat: "Print YES, if the boys can divide the watermelon into two parts, each of them weighing even number of kilos; and NO in the opposite case.",
    constraints: [
      "1 ≤ w ≤ 100",
      "Time Limit: 1.0s",
      "Memory Limit: 256MB"
    ],
    examples: [
      {
        input: "8",
        output: "YES",
        explanation: "For example, the watermelon can be divided into two parts of 2 and 6 kilos respectively (another variant — two parts of 4 and 4 kilos)."
      }
    ],
    notes: "Both parts must have an even number of kilos and positive weights (weight > 0). Therefore, 2 cannot be divided into 1 and 1 since they are odd, nor can it be divided into 0 and 2."
  },
  '71-A': {
    description: "Sometimes some words like 'localization' or 'internationalization' are so long that writing them many times in one text is quite tiresome.\n\nLet's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation.\n\nThis abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letters. That number is in decimal system and doesn't contain any leading zeroes.\n\nThus, 'localization' will be spelt as 'l10n', and 'internationalization' will be spelt as 'i18n'.\n\nYou are suggested to automatize the process of changing the words with abbreviations. All too long words should be replaced by the abbreviation and the words that are not too long should not undergo any changes.",
    inputFormat: "The first line contains an integer n (1 ≤ n ≤ 100). Each of the following n lines contains one word. All words consist of lowercase Latin letters and possess the length of from 1 to 100 characters.",
    outputFormat: "Print n lines. The i-th line should contain the result of the abbreviation of the i-th word from the input.",
    constraints: [
      "1 ≤ n ≤ 100",
      "Word length: 1 to 100 characters",
      "Time Limit: 1.0s",
      "Memory Limit: 256MB"
    ],
    examples: [
      {
        input: "4\nword\nlocalization\ninternationalization\npneumonoultramicroscopicsilicovolcanoconiosis",
        output: "word\nl10n\ni18n\np43s",
        explanation: "The word 'word' is 4 letters (not too long). 'localization' is 12 letters, starts with 'l', ends with 'n', with 10 letters in between. 'pneumonoultramicroscopicsilicovolcanoconiosis' is 45 letters long."
      }
    ],
    notes: "A word is considered too long only if its length is strictly greater than 10."
  },
  '1-A': {
    description: "Theatre Square in the capital city of Berland has a rectangular shape with the size n × m meters. On the occasion of the city's anniversary, a decision was taken to pave the Square with square granite flagstones of size a × a. What is the least number of flagstones needed to pave the Square? It's allowed to pave the larger surface than the Theatre Square, but the Square has to be covered. It's not allowed to break the flagstones. The sides of flagstones should be parallel to the sides of the Square.",
    inputFormat: "The input contains three positive integers: n, m and a (1 ≤ n, m, a ≤ 10^9).",
    outputFormat: "Print the needed number of flagstones.",
    constraints: [
      "1 ≤ n, m, a ≤ 10^9",
      "Time Limit: 2.0s",
      "Memory Limit: 256MB"
    ],
    examples: [
      {
        input: "6 6 4",
        output: "4",
        explanation: "We need 2 flagstones for width (covering 8 meters > 6) and 2 for height (covering 8 meters > 6). Total: 2 * 2 = 4."
      }
    ],
    notes: "Since n, m, and a can be very large, you should use 64-bit integer types (long long in C++, long in Java) to prevent integer overflow."
  },
  '158-A': {
    description: "\"Contestant who earns a score equal to or greater than the k-th place finisher's score will advance to the next round, as long as the contestant earns a positive score...\"\n\nCalculate the number of participants who will advance to the next round.",
    inputFormat: "The first line of the input contains two integers n and k (1 ≤ k ≤ n ≤ 50) separated by a space. The second line contains n space-separated integers a1, a2, ..., an (0 ≤ ai ≤ 100), where ai is the score earned by the participant who got the i-th place. The given sequence is non-increasing.",
    outputFormat: "Output the number of participants who advance.",
    constraints: [
      "1 ≤ k ≤ n ≤ 50",
      "0 ≤ ai ≤ 100",
      "Time Limit: 3.0s",
      "Memory Limit: 256MB"
    ],
    examples: [
      {
        input: "8 5\n10 9 8 7 7 7 5 5",
        output: "6",
        explanation: "The score of the 5th place finisher is 7. The first 6 participants scored 7 or higher. Participant 7 and 8 did not qualify because their scores are strictly less than 7."
      },
      {
        input: "4 2\n0 0 0 0",
        output: "0",
        explanation: "All scores are zero. To advance, a contestant must have a strictly positive score."
      }
    ],
    notes: "Contestants must have a score strictly greater than 0 to advance."
  },
  '4-C': {
    description: "A new e-mail service 'Berlandesk' is going to be launched in Berland in the near future. The site administration wants to register users as quickly as possible, which is why they decided to use the following system.\n\nEach time a new user wants to register, he sends the system a request with his desired username. If such a name does not exist in the system database yet, it is entered into the database and the user receives the response OK, confirming the successful registration. If the name already exists, the system writes a new name into the database, which consists of the requested name and some integer suffix (starting from 1: name1, name2, ...), and sends the user this name to let him know.",
    inputFormat: "The first line contains number n (1 ≤ n ≤ 10^5). The following n lines contain the desired usernames, one per line. Each name consists of lowercase Latin letters and has length from 1 to 32.",
    outputFormat: "Print n lines. If the name is registered for the first time, output OK. Otherwise, output the newly registered name.",
    constraints: [
      "1 ≤ n ≤ 10^5",
      "Username length: 1 to 32 characters",
      "Time Limit: 2.0s",
      "Memory Limit: 64MB"
    ],
    examples: [
      {
        input: "4\nfirst\nfirst\nsecond\nfirst",
        output: "OK\nfirst1\nOK\nfirst2",
        explanation: "The first registration of 'first' and 'second' return OK. The second registration of 'first' gets suffix 1. The third gets suffix 2."
      }
    ],
    notes: "Use a hash map or dictionary to keep track of registered usernames and their frequencies for O(1) average lookup time."
  }
};

export function getProblemDetails(contestId, index, problemName, tags = [], rating = 1200) {
  const key = `${contestId}-${index}`;
  if (POPULAR_PROBLEMS[key]) {
    return {
      ...POPULAR_PROBLEMS[key],
      title: problemName,
      difficulty: rating <= 1200 ? 'Easy' : rating <= 1900 ? 'Medium' : 'Hard',
      rating,
      tags
    };
  }

  // Fallback / Dynamic generator
  const cleanTags = tags.length > 0 ? tags : ['general'];
  const topic = cleanTags[0].toLowerCase();
  
  let description = `Given a set of conditions, you need to solve the problem "${problemName}" using efficient algorithms.`;
  let inputFormat = "Standard input format according to the problem constraints.";
  let outputFormat = "Standard output format. Print the answer in a single line.";
  let constraints = [
    "Time Limit: 2.0s",
    "Memory Limit: 256MB",
    `Rating: ${rating}`
  ];
  let examples = [];
  let notes = "Make sure to optimize your solution. Think about edge cases and potential integer overflows.";

  if (topic.includes('dp') || topic.includes('dynamic programming')) {
    description = `You are given a sequence of integers. You want to find the optimal sub-sequence or partition that maximizes or minimizes a cost function associated with the problem "${problemName}".\n\nFormulate a recurrence relation where DP[i] represents the optimal value for the subproblem ending at index i. Transition by iterating through valid previous states and selecting the best one.`;
    inputFormat = "The first line contains an integer N, the size of the array. The second line contains N space-separated integers representing the array values.";
    outputFormat = "Print a single integer representing the maximum or minimum possible cost.";
    constraints.push("1 ≤ N ≤ 2 × 10^5", "-10^9 ≤ A[i] ≤ 10^9");
    examples = [
      {
        input: "5\n1 2 3 4 5",
        output: "15",
        explanation: "The optimal selection is to take all elements, summing up to 15."
      }
    ];
    notes = "Can you optimize the space complexity from O(N) to O(1) by only keeping track of the last few DP states?";
  } else if (topic.includes('graph') || topic.includes('tree') || topic.includes('dfs') || topic.includes('bfs')) {
    description = `You are given a graph representing the network of connections for "${problemName}". There are N nodes and M edges. You need to find the shortest path, minimum spanning tree, or check connectivity between a source node and all other nodes.\n\nUse standard graph traversal (DFS, BFS, Dijkstra, or Kruskal) to traverse the components and compute the required metric.`;
    inputFormat = "The first line contains N (nodes) and M (edges). Each of the next M lines contains three integers u, v, and w representing a directed edge from u to v with weight w.";
    outputFormat = "Print the shortest distance or connectivity status as specified.";
    constraints.push("1 ≤ N ≤ 10^5", "1 ≤ M ≤ 2 × 10^5", "1 ≤ w ≤ 10^9");
    examples = [
      {
        input: "4 4\n1 2 2\n2 3 3\n3 4 1\n1 3 6",
        output: "6",
        explanation: "The shortest path from node 1 to node 4 goes 1 -> 2 -> 3 -> 4, with a total weight of 2 + 3 + 1 = 6. The direct edge 1 -> 3 has weight 6, which is not strictly better."
      }
    ];
    notes = "Use adjacency list representation and priority queues for shortest path computations to fit within the time limit.";
  } else if (topic.includes('greedy') || topic.includes('sortings')) {
    description = `You are given a set of jobs, intervals, or weights. For "${problemName}", you want to maximize the number of compatible tasks you can perform or minimize the total penalty.\n\nApply a greedy choice property: sort the inputs by end times, weights, or ratios, and make the locally optimal choice at each step. Prove that this leads to a globally optimal solution.`;
    inputFormat = "The first line contains an integer N. The next N lines contain two integers each, representing the start and end times of the intervals.";
    outputFormat = "Print the maximum number of intervals you can select without overlaps.";
    constraints.push("1 ≤ N ≤ 10^5", "0 ≤ start < end ≤ 10^9");
    examples = [
      {
        input: "3\n1 3\n2 4\n3 6",
        output: "2",
        explanation: "We can choose intervals [1, 3] and [3, 6] without overlaps. The interval [2, 4] overlaps with both."
      }
    ];
    notes = "Sorting the intervals by end-time is a standard approach to maximize interval scheduling.";
  } else if (topic.includes('binary search')) {
    description = `You are given a monotonic search space (such as a sorted array or a continuous function). For "${problemName}", you need to find the smallest value X that satisfies a particular feasibility condition.\n\nImplement a binary search over the answer. Write a helper function 'bool check(X)' that returns true if X is feasible in O(N) time.`;
    inputFormat = "The first line contains N and K. The second line contains N integers representing the elements.";
    outputFormat = "Print the minimum possible value that satisfies the condition.";
    constraints.push("1 ≤ N ≤ 10^5", "1 ≤ K ≤ N", "1 ≤ A[i] ≤ 10^9");
    examples = [
      {
        input: "5 3\n1 2 4 7 9",
        output: "4",
        explanation: "Binary searching the answer between 1 and 9 reveals 4 is the optimal partition limit."
      }
    ];
    notes = "Pay attention to the low and high boundaries of your binary search range to avoid off-by-one errors.";
  } else {
    // Generic math / implementation
    description = `You need to solve "${problemName}". Read the input numbers and implement the simulation or arithmetic calculations precisely as defined. Handle constraints and special inputs carefully.`;
    inputFormat = "Input consists of test cases. The first line contains T, the number of test cases. Each test case is described in a single line.";
    outputFormat = "For each testcase, print the calculated output.";
    constraints.push("1 ≤ T ≤ 100", "0 ≤ Val ≤ 10^18");
    examples = [
      {
        input: "2\n5\n10",
        output: "15\n30",
        explanation: "In this example, the output is simply 3 times the input value."
      }
    ];
  }

  return {
    description,
    inputFormat,
    outputFormat,
    constraints,
    examples,
    notes,
    title: problemName,
    difficulty: rating <= 1200 ? 'Easy' : rating <= 1900 ? 'Medium' : 'Hard',
    rating,
    tags
  };
}
