export interface PracticeQuestion {
  title: string;
  type: 'quiz';
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export const practiceQuestionsPool: Record<string, PracticeQuestion[]> = {
  'Programming & DSA': [
    {
      title: 'Time Complexity: Nested Loops',
      type: 'quiz',
      question: 'What is the time complexity of the following code snippet?\n\nfor(let i=0; i<n; i++)\n  for(let j=0; j<n; j++)\n    // constant time operation',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(n³)'],
      correctOptionIndex: 2,
      explanation: 'Since the outer loop runs n times and the inner loop runs n times for each outer loop iteration, the total operations are n * n = n², giving a time complexity of O(n²).'
    },
    {
      title: 'Stack Behavior',
      type: 'quiz',
      question: 'Which of the following principles describes the operation of a Stack data structure?',
      options: ['First In, First Out (FIFO)', 'Last In, First Out (LIFO)', 'First In, Last Out (FILO)', 'Both LIFO and FILO'],
      correctOptionIndex: 1,
      explanation: 'A Stack is a LIFO (Last In, First Out) structure where the element added last is the first to be removed.'
    },
    {
      title: 'Queue Behavior',
      type: 'quiz',
      question: 'Which principle governs the insertion and deletion of elements in a Queue?',
      options: ['First In, First Out (FIFO)', 'Last In, First Out (LIFO)', 'LIFO and FIFO mixed', 'Random Access'],
      correctOptionIndex: 0,
      explanation: 'A Queue operates under the FIFO (First In, First Out) principle, where elements are inserted at the rear and removed from the front.'
    },
    {
      title: 'Array Index Lookup',
      type: 'quiz',
      question: 'What is the worst-case time complexity to access an element in a standard array given its index?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctOptionIndex: 0,
      explanation: 'Accessing an array element by index is an O(1) constant time operation because the memory address is calculated directly.'
    },
    {
      title: 'Linked List Lookup',
      type: 'quiz',
      question: 'What is the worst-case time complexity to search for a specific value in a singly linked list of size n?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctOptionIndex: 2,
      explanation: 'Searching requires traversing the list from head to tail in the worst case, yielding a time complexity of O(n).'
    },
    {
      title: 'Binary Search Tree Height',
      type: 'quiz',
      question: 'What is the height of a perfectly balanced Binary Search Tree containing n elements?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctOptionIndex: 1,
      explanation: 'A perfectly balanced BST splits search spaces in half at each level, resulting in a tree height of O(log n).'
    },
    {
      title: 'Bubble Sort Complexity',
      type: 'quiz',
      question: 'What is the worst-case time complexity of the Bubble Sort algorithm?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(2^n)'],
      correctOptionIndex: 2,
      explanation: 'Bubble Sort compares adjacent elements and swaps them, requiring nested loops that yield O(n²) time complexity in the worst case.'
    },
    {
      title: 'Quick Sort Average Case',
      type: 'quiz',
      question: 'What is the average-case time complexity of the Quick Sort algorithm?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correctOptionIndex: 1,
      explanation: 'On average, partitioning splits the array into two roughly equal halves, leading to an average-case runtime of O(n log n).'
    },
    {
      title: 'Hash Collisions Resolution',
      type: 'quiz',
      question: 'Which of the following is an open addressing technique to resolve hash collisions?',
      options: ['Chaining', 'Linear Probing', 'Double Hashing', 'Both Linear Probing and Double Hashing'],
      correctOptionIndex: 3,
      explanation: 'Linear Probing and Double Hashing are open addressing techniques. Chaining is a separate closed addressing technique using linked lists.'
    },
    {
      title: 'Dijkstra\'s Algorithm',
      type: 'quiz',
      question: 'Dijkstra\'s algorithm is used to solve which of the following problems?',
      options: ['Minimum Spanning Tree', 'Single-source shortest path', 'All-pairs shortest path', 'Network flow optimization'],
      correctOptionIndex: 1,
      explanation: 'Dijkstra\'s algorithm calculates the shortest path from a single source vertex to all other vertices in a weighted graph.'
    },
    {
      title: 'Graph Representation Space',
      type: 'quiz',
      question: 'Which graph representation is more space-efficient for sparse graphs?',
      options: ['Adjacency Matrix', 'Adjacency List', 'Incidence Matrix', 'All are equally efficient'],
      correctOptionIndex: 1,
      explanation: 'Adjacency list only stores existing edges, making it O(V + E) space. Adjacency matrix is O(V²) which is inefficient for sparse graphs.'
    },
    {
      title: 'DFS Implementation',
      type: 'quiz',
      question: 'Which of the following data structures is implicitly or explicitly used in Depth First Search (DFS)?',
      options: ['Queue', 'Stack', 'Heap', 'Hash Map'],
      correctOptionIndex: 1,
      explanation: 'DFS uses a Stack (either the call stack via recursion or an explicit stack data structure) to track nodes along paths.'
    },
    {
      title: 'BFS Implementation',
      type: 'quiz',
      question: 'Which data structure is typically used to implement Breadth-First Search (BFS)?',
      options: ['Stack', 'Queue', 'Priority Queue', 'BST'],
      correctOptionIndex: 1,
      explanation: 'BFS processes nodes level-by-level, which matches the FIFO behavior of a Queue.'
    },
    {
      title: 'Recursion Base Case',
      type: 'quiz',
      question: 'What is the purpose of a base case in a recursive function?',
      options: ['To initialize local variables', 'To terminate the recursion and prevent infinite stack growth', 'To log function execution', 'To optimize memory allocation'],
      correctOptionIndex: 1,
      explanation: 'The base case provides a termination condition, preventing the function from calling itself indefinitely and causing a stack overflow.'
    },
    {
      title: 'Min Heap Properties',
      type: 'quiz',
      question: 'In a complete Min-Heap, where is the smallest element located?',
      options: ['At the root node', 'At a leaf node', 'In the middle level', 'At the rightmost bottom node'],
      correctOptionIndex: 0,
      explanation: 'By definition, every parent node in a Min-Heap is smaller than or equal to its children, making the root the smallest element.'
    },
    {
      title: 'Trie Data Structure',
      type: 'quiz',
      question: 'Which application benefit is most associated with a Trie (Prefix Tree) data structure?',
      options: ['Fast sorting of numerical arrays', 'Auto-complete and prefix searching in strings', 'Encrypting passwords', 'Calculating shortest routing paths'],
      correctOptionIndex: 1,
      explanation: 'Tries store characters in paths sharing common prefixes, making them highly efficient for autocomplete and prefix lookups.'
    },
    {
      title: 'HashMap Search average case',
      type: 'quiz',
      question: 'What is the average-case time complexity of looking up a key in a well-distributed Hash Map?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctOptionIndex: 0,
      explanation: 'If the hash function distributes keys evenly, the bucket size is small and lookup takes O(1) constant average time.'
    },
    {
      title: 'Inorder BST Traversal',
      type: 'quiz',
      question: 'In-order traversal of a Binary Search Tree (BST) visits nodes in which sorted order?',
      options: ['Ascending order', 'Descending order', 'Level-by-level order', 'Reverse topological order'],
      correctOptionIndex: 0,
      explanation: 'An in-order traversal (Left, Root, Right) of a BST always processes values in ascending (sorted) order.'
    },
    {
      title: 'Dynamic Programming',
      type: 'quiz',
      question: 'Dynamic Programming is optimal for problems that display which two characteristics?',
      options: ['Greedy choices and sorting', 'Overlapping subproblems and optimal substructure', 'Divide-and-conquer and hashing', 'Randomization and search pruning'],
      correctOptionIndex: 1,
      explanation: 'Dynamic Programming works by solving overlapping subproblems once and building up answers using optimal substructures.'
    },
    {
      title: 'Kruskal\'s Algorithm',
      type: 'quiz',
      question: 'Kruskal\'s algorithm for Minimum Spanning Trees (MST) utilizes which technique to verify cycle creation?',
      options: ['Disjoint Set Union (Union-Find)', 'Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Dijkstra\'s Priority Queue'],
      correctOptionIndex: 0,
      explanation: 'Kruskal\'s uses the Disjoint Set Union (Union-Find) structure to efficiently check if two vertices belong to the same component, preventing cycles.'
    }
  ],
  'Web Development': [
    {
      title: 'CSS Flexbox Axes',
      type: 'quiz',
      question: 'Which CSS Flexbox property values align items along the horizontal axis (main axis) and vertical axis (cross axis) when the flex-direction is row?',
      options: [
        'justify-content: center; align-items: center;',
        'align-content: center; text-align: center;',
        'flex-pack: center; vertical-align: middle;',
        'margin: auto;'
      ],
      correctOptionIndex: 0,
      explanation: 'justify-content aligns flex items along the main axis, while align-items aligns them along the cross axis. In flex-direction: row, main axis is horizontal and cross axis is vertical.'
    },
    {
      title: 'HTTP Status Codes: Client Error',
      type: 'quiz',
      question: 'Which HTTP status code represents the "Unauthorized" error?',
      options: ['400', '401', '403', '404'],
      correctOptionIndex: 1,
      explanation: 'HTTP 401 represents Unauthorized (needs credentials), whereas HTTP 403 represents Forbidden (credentials provided but lack permission).'
    },
    {
      title: 'Semantic HTML Elements',
      type: 'quiz',
      question: 'Which HTML5 element is used to display self-contained content, like illustrations, diagrams, photos, or code listings?',
      options: ['<section>', '<article>', '<figure>', '<aside>'],
      correctOptionIndex: 2,
      explanation: '<figure> represents self-contained flow content, optionally with a caption (<figcaption>).'
    },
    {
      title: 'JavaScript Closures',
      type: 'quiz',
      question: 'What is a closure in JavaScript?',
      options: [
        'A function bundled with references to its surrounding lexical environment',
        'A method to close database connections',
        'A CSS properties grouping syntax',
        'A compile-time variable declaration scope'
      ],
      correctOptionIndex: 0,
      explanation: 'A closure is created when an inner function retains access to variables declared in its outer scope, even after the outer function finishes executing.'
    },
    {
      title: 'React Hooks: State Management',
      type: 'quiz',
      question: 'Which Hook allows state management inside React functional components?',
      options: ['useEffect', 'useMemo', 'useState', 'useRef'],
      correctOptionIndex: 2,
      explanation: 'useState is the built-in React Hook that enables functional components to maintain, track, and update internal state.'
    },
    {
      title: 'Virtual DOM Principle',
      type: 'quiz',
      question: 'What is the primary benefit of React\'s Virtual DOM?',
      options: [
        'It speeds up download speeds of assets',
        'It minimizes expensive, direct DOM manipulation by batching and diffing changes',
        'It replaces regular CSS templates',
        'It encrypts database payload outputs'
      ],
      correctOptionIndex: 1,
      explanation: 'The Virtual DOM keeps a representation of the UI in memory and uses a diffing algorithm to update only the modified real DOM nodes.'
    },
    {
      title: 'CSS Grid Template Columns',
      type: 'quiz',
      question: 'Which CSS declaration creates a 3-column layout where each column occupies equal width?',
      options: [
        'grid-template-columns: repeat(3, 1fr);',
        'grid-template-columns: 33% 33% 33%;',
        'grid-columns: 1fr 1fr 1fr;',
        'grid-template-rows: repeat(3, 1fr);'
      ],
      correctOptionIndex: 0,
      explanation: 'repeat(3, 1fr) creates three tracks, each taking 1 fractional unit (equal width) of the remaining space.'
    },
    {
      title: 'CORS Definition',
      type: 'quiz',
      question: 'What does CORS stand for in web security?',
      options: [
        'Cross-Origin Resource Sharing',
        'Client-Oriented Remote Server',
        'Cross-Object Routing System',
        'Cipher-Oriented Request Shield'
      ],
      correctOptionIndex: 0,
      explanation: 'CORS (Cross-Origin Resource Sharing) is a browser mechanism that uses HTTP headers to allow or restrict resources loaded from external origins.'
    },
    {
      title: 'REST API HTTP Methods',
      type: 'quiz',
      question: 'Which HTTP method should be used to partially update an existing resource in a RESTful API?',
      options: ['POST', 'PUT', 'PATCH', 'DELETE'],
      correctOptionIndex: 2,
      explanation: 'PATCH is designed for making partial modifications to a resource. PUT is typically used to replace the entire resource.'
    },
    {
      title: 'JavaScript DataType Check',
      type: 'quiz',
      question: 'What does `typeof null` return in JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"symbol"'],
      correctOptionIndex: 2,
      explanation: 'This is a long-standing bug/behavior in JavaScript; `typeof null` evaluates to "object".'
    },
    {
      title: 'HTML Storage Durability',
      type: 'quiz',
      question: 'Which client-side storage mechanism persists data even after closing the browser tab or window?',
      options: ['SessionStorage', 'LocalStorage', 'RAM cache', 'Cookies without Max-Age'],
      correctOptionIndex: 1,
      explanation: 'LocalStorage stores data indefinitely with no expiration time, whereas SessionStorage is cleared when the tab is closed.'
    },
    {
      title: 'JavaScript Event Delegation',
      type: 'quiz',
      question: 'What is the core principle behind JavaScript Event Delegation?',
      options: [
        'Attaching individual event listeners to every single child node',
        'Attaching a single event listener to a parent node and leveraging event bubbling',
        'Blocking all event triggers entirely',
        'Using CSS selectors to trigger JS calculations'
      ],
      correctOptionIndex: 1,
      explanation: 'Event delegation allows you to handle events at a parent level rather than attaching listeners to multiple target nodes, simplifying dynamic elements management.'
    },
    {
      title: 'CSS Box Model',
      type: 'quiz',
      question: 'Which property in the CSS Box Model surrounds the padding and sits inside the margin?',
      options: ['Content', 'Border', 'Outline', 'Glow'],
      correctOptionIndex: 1,
      explanation: 'The order from inside out is: Content -> Padding -> Border -> Margin. Border surrounds padding.'
    },
    {
      title: 'Next.js Rendering',
      type: 'quiz',
      question: 'In Next.js, what is the default rendering type of components inside the App Router?',
      options: ['Client Components', 'Server Components', 'Static Page Templates', 'Server-Side Rendered Templates'],
      correctOptionIndex: 1,
      explanation: 'By default, Next.js App Router treats all components as React Server Components (RSC) unless marked with the "use client" directive.'
    },
    {
      title: 'Tailwind CSS Layout',
      type: 'quiz',
      question: 'Which Tailwind CSS class initiates a flex container layout?',
      options: ['flex-layout', 'flexbox', 'flex', 'd-flex'],
      correctOptionIndex: 2,
      explanation: 'The class `flex` sets `display: flex;` in Tailwind CSS.'
    },
    {
      title: 'JavaScript Promises states',
      type: 'quiz',
      question: 'Which of the following is NOT a state of a JavaScript Promise?',
      options: ['Pending', 'Fulfilled', 'Rejected', 'Resolved'],
      correctOptionIndex: 3,
      explanation: 'The three states of a Promise are: Pending, Fulfilled, and Rejected. "Resolved" is a state of completion that transitions a promise to fulfilled/rejected, but is not a separate state.'
    },
    {
      title: 'CSS Sticky Positioning',
      type: 'quiz',
      question: 'Which CSS positioning value toggles between relative and fixed depending on the scroll offset?',
      options: ['fixed', 'absolute', 'relative', 'sticky'],
      correctOptionIndex: 3,
      explanation: 'position: sticky behaves like relative positioning until the viewport reaches a specified threshold, where it behaves like fixed.'
    },
    {
      title: 'Web Accessibility ARIA',
      type: 'quiz',
      question: 'What does the acronym ARIA stand for in web accessibility specifications?',
      options: [
        'Accessible Rich Internet Applications',
        'Alternate Resource Interface Arrangement',
        'Automatic Reading Information Architecture',
        'Audio Responsive Interactive Assets'
      ],
      correctOptionIndex: 0,
      explanation: 'ARIA (Accessible Rich Internet Applications) defines ways to make web content and applications more accessible to people with disabilities.'
    },
    {
      title: 'Vite and Webpack purpose',
      type: 'quiz',
      question: 'What is the primary role of bundlers like Webpack or Vite in frontend builds?',
      options: [
        'To host static websites on servers',
        'To bundle modular JS, CSS, and asset files into optimized bundles for browsers',
        'To run backend database migrations',
        'To compile database queries'
      ],
      correctOptionIndex: 1,
      explanation: 'Bundlers collect modular code, libraries, and assets, optimization-checking them to generate HTML/JS/CSS assets ready for browser consumption.'
    },
    {
      title: 'React hook: performance',
      type: 'quiz',
      question: 'Which React Hook is used to memoize (cache) the result of an expensive calculation?',
      options: ['useCallback', 'useMemo', 'useEffect', 'useReducer'],
      correctOptionIndex: 1,
      explanation: 'useMemo caches the returned value of a function, recalculating only when dependencies change. useCallback memoizes the function definition itself.'
    }
  ],
  'AI & Machine Learning': [
    {
      title: 'Model Knowledge Check: Activation Functions',
      type: 'quiz',
      question: 'Which neural network activation function maps real-valued numbers into a probability-like range between 0 and 1?',
      options: [
        'Rectified Linear Unit (ReLU)',
        'Hyperbolic Tangent (tanh)',
        'Sigmoid Function',
        'Softplus Function'
      ],
      correctOptionIndex: 2,
      explanation: 'The Sigmoid function maps any real-valued number into a value between 0 and 1, representing a probability distribution.'
    },
    {
      title: 'Supervised vs Unsupervised',
      type: 'quiz',
      question: 'Which of the following tasks is classified as Unsupervised Learning?',
      options: ['Spam Email Classification', 'House Price Prediction', 'Customer Segment Clustering', 'Image Object Labeling'],
      correctOptionIndex: 2,
      explanation: 'Clustering customers does not rely on labeled historical targets, making it an Unsupervised Learning task. The other tasks are Supervised.'
    },
    {
      title: 'Overfitting Mitigation',
      type: 'quiz',
      question: 'Which technique is specifically used to prevent overfitting in deep neural networks?',
      options: ['Increasing model capacity', 'Dropout', 'Learning rate boosting', 'Omitting training validation'],
      correctOptionIndex: 1,
      explanation: 'Dropout randomly deactivates nodes during training, preventing nodes from co-adapting and improving generalization.'
    },
    {
      title: 'CNN Primary Application',
      type: 'quiz',
      question: 'Convolutional Neural Networks (CNNs) are primarily structured to process which type of data?',
      options: ['Tabular sales database rows', 'Sequential audio speech transcripts', 'Two-dimensional spatial grid data (images)', 'Graph connections database links'],
      correctOptionIndex: 2,
      explanation: 'CNNs leverage local receptive fields and weight sharing, making them highly optimized for processing images (grid data).'
    },
    {
      title: 'Gradient Descent Optimization',
      type: 'quiz',
      question: 'What is the primary objective of the Gradient Descent algorithm in machine learning?',
      options: [
        'To label unstructured data rows',
        'To minimize the loss function by iteratively updating model weights',
        'To delete outlier rows in datasets',
        'To regularize models'
      ],
      correctOptionIndex: 1,
      explanation: 'Gradient Descent calculates the gradient of the loss function and updates weights in the opposite direction to minimize error.'
    },
    {
      title: 'Linear Regression Target',
      type: 'quiz',
      question: 'Linear Regression is used to predict which type of target variable?',
      options: ['Categorical classes', 'Continuous numerical values', 'Binary labels', 'Unordered clusters'],
      correctOptionIndex: 1,
      explanation: 'Linear Regression maps input features to a continuous output range (like price, temperature, or speed).'
    },
    {
      title: 'Bias-Variance Tradeoff',
      type: 'quiz',
      question: 'Underfitting is characterized by which of the following?',
      options: ['High Bias, Low Variance', 'Low Bias, High Variance', 'High Bias, High Variance', 'Low Bias, Low Variance'],
      correctOptionIndex: 0,
      explanation: 'Underfitting occurs when a model is too simple (High Bias) and fails to learn the patterns in both training and test sets.'
    },
    {
      title: 'Confusion Matrix Precision',
      type: 'quiz',
      question: 'What is the formula to calculate Precision in a binary classification Confusion Matrix?',
      options: [
        'TP / (TP + FP)',
        'TP / (TP + FN)',
        'TN / (TN + FP)',
        '(TP + TN) / Total'
      ],
      correctOptionIndex: 0,
      explanation: 'Precision is the ratio of true positives to total predicted positives: TP / (TP + FP).'
    },
    {
      title: 'Loss Functions: MSE',
      type: 'quiz',
      question: 'What does Mean Squared Error (MSE) calculate?',
      options: [
        'The average absolute distance between predictions and actual values',
        'The average of the squared differences between predictions and actual values',
        'The percentage of correct classifications',
        'The log likelihood of probabilities'
      ],
      correctOptionIndex: 1,
      explanation: 'MSE squares the difference between prediction and actual target, averaging those squares over the dataset.'
    },
    {
      title: 'Random Forest Model',
      type: 'quiz',
      question: 'A Random Forest is constructed using which ensemble technique?',
      options: ['Boosting', 'Bagging (Bootstrap Aggregating)', 'Stacking', 'Voting Classifier'],
      correctOptionIndex: 1,
      explanation: 'Random Forest builds multiple independent decision trees on bootstrapped subsets of data (Bagging), aggregating their predictions.'
    },
    {
      title: 'SVM Margin Maximization',
      type: 'quiz',
      question: 'Support Vector Machines (SVM) find the optimal decision boundary by doing what?',
      options: [
        'Minimizing classification errors only',
        'Maximizing the margin between the boundary and support vectors',
        'Clustering target data points',
        'Reducing data dimensionality'
      ],
      correctOptionIndex: 1,
      explanation: 'SVM seeks to maximize the distance (margin) between the separating hyperplane and the closest data points of any class.'
    },
    {
      title: 'K-Means Clustering Type',
      type: 'quiz',
      question: 'What type of machine learning task is K-Means?',
      options: ['Supervised Regression', 'Supervised Classification', 'Unsupervised Clustering', 'Reinforcement Learning'],
      correctOptionIndex: 2,
      explanation: 'K-Means partitions unlabeled data into K distinct clusters, which is an unsupervised clustering task.'
    },
    {
      title: 'Dimensionality Reduction',
      type: 'quiz',
      question: 'Principal Component Analysis (PCA) performs dimensionality reduction by doing what?',
      options: [
        'Deleting columns with low correlation to targets',
        'Projecting data into orthogonal principal components that maximize variance',
        'Hashing high-dimensional spaces',
        'Adding random noise to inputs'
      ],
      correctOptionIndex: 1,
      explanation: 'PCA projects high-dimensional data onto lower-dimensional coordinates (principal components) that capture the maximum variance.'
    },
    {
      title: 'Hyperparameters: Learning Rate',
      type: 'quiz',
      question: 'What is the risk of selecting a learning rate that is too high?',
      options: [
        'The model will take too long to train',
        'The optimization may overshoot the minimum and fail to converge',
        'The model will automatically overfit',
        'The loss function will become zero immediately'
      ],
      correctOptionIndex: 1,
      explanation: 'A learning rate that is too large causes weight updates to take steps that are too big, overshooting the minimum and causing training to diverge.'
    },
    {
      title: 'Transformer Architecture',
      type: 'quiz',
      question: 'Which mechanism is the core innovation of the Transformer neural network architecture?',
      options: ['Recurrence loops', 'Convolution operations', 'Self-Attention', 'Gradient clipping'],
      correctOptionIndex: 2,
      explanation: 'Self-Attention allows Transformers to model relationships between tokens regardless of their distance in a sequence, enabling massive parallelism.'
    },
    {
      title: 'Precision vs Recall',
      type: 'quiz',
      question: 'Recall is the metric that answers which of the following questions?',
      options: [
        'What proportion of positive identifications was actually correct?',
        'What proportion of actual positives was identified correctly?',
        'How many total predictions were accurate?',
        'What is the ratio of true negatives to total negatives?'
      ],
      correctOptionIndex: 1,
      explanation: 'Recall (TP / (TP + FN)) measures the proportion of actual positive elements that were successfully retrieved by the model.'
    },
    {
      title: 'Neural Network Epoch',
      type: 'quiz',
      question: 'What does one "Epoch" represent in neural network training?',
      options: [
        'Processing one single batch of training inputs',
        'One full pass of the entire training dataset through the network',
        'Optimizing a single weight parameter',
        'One second of runtime'
      ],
      correctOptionIndex: 1,
      explanation: 'An epoch is completed when the entire training dataset has passed forward and backward through the neural network exactly once.'
    },
    {
      title: 'Cross-Validation split',
      type: 'quiz',
      question: 'What is the primary benefit of K-Fold Cross-Validation?',
      options: [
        'It speeds up training times',
        'It provides a robust estimate of model performance by training and testing on multiple data splits',
        'It deletes duplicate features',
        'It guarantees 100% test accuracy'
      ],
      correctOptionIndex: 1,
      explanation: 'K-Fold splits data into K subsets, training K times on K-1 subsets and validating on the remaining subset to ensure model assessment is not biased to a single split.'
    },
    {
      title: 'Softmax Activation',
      type: 'quiz',
      question: 'Where is the Softmax activation function typically positioned in a neural network?',
      options: ['At the input layer', 'In hidden convolutional layers', 'At the output layer of multiclass classifiers', 'Before weight initialization'],
      correctOptionIndex: 2,
      explanation: 'Softmax scales outputs of a model to sum to 1, converting them into class probabilities. This is positioned at the final output layer.'
    },
    {
      title: 'Regularization techniques',
      type: 'quiz',
      question: 'L2 Regularization (Ridge) adds which penalty term to the loss function?',
      options: [
        'The sum of absolute values of weights',
        'The sum of squared values of weights',
        'The derivative of weights',
        'The maximum weight value'
      ],
      correctOptionIndex: 1,
      explanation: 'L2 regularization adds a penalty proportional to the sum of squared weights, penalizing larger weights and keeping them small.'
    }
  ],
  'Aptitude': [
    {
      title: 'Logical Math Challenge: Work & Time Rate',
      type: 'quiz',
      question: 'If Pipe A fills a tank in 4 hours and Pipe B drains the full tank in 6 hours, how long will it take to fill the tank if both pipes are opened simultaneously?',
      options: [
        '8 hours',
        '10 hours',
        '12 hours',
        '15 hours'
      ],
      correctOptionIndex: 2,
      explanation: 'In 1 hour, A fills 1/4 of the tank and B drains 1/6. Net rate per hour = 1/4 - 1/6 = 1/12. Thus, it will take 12 hours to fill the tank.'
    },
    {
      title: 'Time and Distance: Average Speed',
      type: 'quiz',
      question: 'A car travels from city A to B at 40 km/h and returns from B to A at 60 km/h. What is the average speed of the car for the entire journey?',
      options: ['48 km/h', '50 km/h', '52 km/h', '55 km/h'],
      correctOptionIndex: 0,
      explanation: 'Average speed for equal distances = 2xy / (x + y). Here, 2 * 40 * 60 / (40 + 60) = 4800 / 100 = 48 km/h.'
    },
    {
      title: 'Profit and Loss percentage',
      type: 'quiz',
      question: 'An article is sold for $300 at a profit of 20%. What was its cost price?',
      options: ['$240', '$250', '$260', '$280'],
      correctOptionIndex: 1,
      explanation: 'Cost Price = Selling Price / (1 + Profit%). Here, Cost Price = 300 / 1.2 = $250.'
    },
    {
      title: 'Compound Interest',
      type: 'quiz',
      question: 'A sum of $1000 is invested at 10% per annum compound interest, compounded annually. What is the total interest earned after 2 years?',
      options: ['$200', '$210', '$220', '$250'],
      correctOptionIndex: 1,
      explanation: 'Amount = P(1 + R/100)^T. A = 1000(1.1)^2 = $1210. Interest = 1210 - 1000 = $210.'
    },
    {
      title: 'Ratio and Proportions',
      type: 'quiz',
      question: 'If A : B = 2 : 3 and B : C = 4 : 5, then what is A : B : C?',
      options: ['2 : 4 : 5', '8 : 12 : 15', '6 : 9 : 15', '8 : 10 : 15'],
      correctOptionIndex: 1,
      explanation: 'To match B, multiply A:B by 4 -> 8:12, and multiply B:C by 3 -> 12:15. This yields A:B:C = 8:12:15.'
    },
    {
      title: 'Percentages math',
      type: 'quiz',
      question: 'If 20% of a number is 80, what is 30% of that number?',
      options: ['100', '120', '140', '160'],
      correctOptionIndex: 1,
      explanation: 'If 20% is 80, then the number is 80 / 0.20 = 400. 30% of 400 = 400 * 0.30 = 120.'
    },
    {
      title: 'Probability: Drawing cards',
      type: 'quiz',
      question: 'What is the probability of drawing a King from a standard deck of 52 playing cards?',
      options: ['1/52', '1/13', '4/13', '1/26'],
      correctOptionIndex: 1,
      explanation: 'There are 4 Kings in a deck of 52 cards. Probability = 4 / 52 = 1 / 13.'
    },
    {
      title: 'Permutations & Combinations',
      type: 'quiz',
      question: 'In how many different ways can the letters of the word "CAT" be arranged?',
      options: ['3', '6', '9', '12'],
      correctOptionIndex: 1,
      explanation: 'The word "CAT" has 3 unique letters. The number of arrangements is 3! = 3 * 2 * 1 = 6.'
    },
    {
      title: 'Averages math',
      type: 'quiz',
      question: 'What is the average of the first five consecutive odd numbers starting from 1?',
      options: ['3', '5', '7', '9'],
      correctOptionIndex: 1,
      explanation: 'The first five odd numbers are 1, 3, 5, 7, and 9. Their sum is 25. Average = 25 / 5 = 5.'
    },
    {
      title: 'Clock Angles',
      type: 'quiz',
      question: 'What is the angle between the hour hand and the minute hand of a clock at 3:00?',
      options: ['60 degrees', '90 degrees', '120 degrees', '180 degrees'],
      correctOptionIndex: 1,
      explanation: 'At 3:00, the minute hand is at 12 and the hour hand is at 3. The angle is exactly 3 steps of 30 degrees = 90 degrees.'
    },
    {
      title: 'Work and Days',
      type: 'quiz',
      question: 'If 10 men can build a wall in 8 days, how many days will it take 5 men to build the same wall?',
      options: ['4 days', '12 days', '16 days', '20 days'],
      correctOptionIndex: 2,
      explanation: 'Total work = men * days = 10 * 8 = 80 man-days. Days for 5 men = 80 / 5 = 16 days.'
    },
    {
      title: 'Train speed crossing',
      type: 'quiz',
      question: 'A train 100 meters long passes a telegraph post in 10 seconds. What is the speed of the train in km/h?',
      options: ['36 km/h', '54 km/h', '72 km/h', '90 km/h'],
      correctOptionIndex: 0,
      explanation: 'Speed = Distance / Time = 100m / 10s = 10 m/s. Convert to km/h: 10 * (18/5) = 36 km/h.'
    },
    {
      title: 'Alligations & Mixtures',
      type: 'quiz',
      question: 'In what ratio must water be mixed with milk costing $12 per liter to obtain a mixture worth $10 per liter?',
      options: ['1:5', '5:1', '2:3', '3:2'],
      correctOptionIndex: 0,
      explanation: 'Using alligation: Milk ($12) vs Water ($0), target is $10. Ratio of Water to Milk = (12 - 10) : (10 - 0) = 2 : 10 = 1 : 5.'
    },
    {
      title: 'Ages calculation',
      type: 'quiz',
      question: 'A father is 4 times as old as his son. In 20 years, he will be twice as old as his son. How old is the son now?',
      options: ['10 years', '15 years', '20 years', '25 years'],
      correctOptionIndex: 0,
      explanation: 'Let son be s, father be 4s. In 20 years: 4s + 20 = 2(s + 20) -> 4s + 20 = 2s + 40 -> 2s = 20 -> s = 10 years.'
    },
    {
      title: 'Number systems units digit',
      type: 'quiz',
      question: 'What is the units digit of 2^34?',
      options: ['2', '4', '8', '6'],
      correctOptionIndex: 1,
      explanation: 'The units digit of powers of 2 repeats in a cycle of 4: (2, 4, 8, 6). 34 mod 4 = 2, so the units digit is the 2nd in cycle, which is 4.'
    },
    {
      title: 'HCF and LCM relation',
      type: 'quiz',
      question: 'The HCF of two numbers is 12 and their product is 720. What is their LCM?',
      options: ['30', '60', '90', '120'],
      correctOptionIndex: 1,
      explanation: 'Product of two numbers = HCF * LCM. LCM = 720 / 12 = 60.'
    },
    {
      title: 'Calendar calculations',
      type: 'quiz',
      question: 'If January 1st of a non-leap year is a Monday, what day is January 1st of the next year?',
      options: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
      correctOptionIndex: 1,
      explanation: 'A non-leap year has 365 days, which is 52 weeks and 1 odd day. Thus, the day advances by 1, making it a Tuesday.'
    },
    {
      title: 'Profit discounts',
      type: 'quiz',
      question: 'A shopkeeper marks his goods 40% above cost price and then allows a 20% discount. What is his net profit percentage?',
      options: ['12%', '15%', '18%', '20%'],
      correctOptionIndex: 0,
      explanation: 'Let CP be 100. Marked price is 140. Selling price = 140 * 0.8 = 112. Profit is 12%.'
    },
    {
      title: 'Partnerships capital',
      type: 'quiz',
      question: 'A and B start a business investing $2000 and $3000 respectively. If they earn a profit of $1000 at the end of the year, what is A\'s share?',
      options: ['$300', '$400', '$500', '$600'],
      correctOptionIndex: 1,
      explanation: 'Profit is shared in the ratio of investments: 2000 : 3000 = 2 : 3. A\'s share = 2/5 * 1000 = $400.'
    },
    {
      title: 'Sequence patterns',
      type: 'quiz',
      question: 'What is the next number in the sequence: 2, 6, 12, 20, 30, ...?',
      options: ['38', '40', '42', '44'],
      correctOptionIndex: 2,
      explanation: 'The differences are consecutive even numbers: +4, +6, +8, +10. The next difference is +12. 30 + 12 = 42.'
    }
  ],
  'Interview Preparation': [
    {
      title: 'Behavioral Skills Check: STAR Framework',
      type: 'quiz',
      question: 'What does each letter in the STAR method for answering behavioral interview questions represent?',
      options: [
        'Strategy, Tactics, Action, Review',
        'Situation, Task, Action, Result',
        'Story, Topic, Analysis, Resolution',
        'System, Target, Achievement, Report'
      ],
      correctOptionIndex: 1,
      explanation: 'STAR stands for Situation, Task, Action, and Result. It is a structured way to answer behavioral questions.'
    },
    {
      title: 'Introduction Hook',
      type: 'quiz',
      question: 'When asked "Tell me about yourself" in an interview, what is the best structure to follow?',
      options: [
        'Summarize your entire personal life story starting from childhood',
        'Focus on Present achievements, Past relevant experience, and Future career alignment',
        'List out all courses you failed before passing',
        'State only your salary expectations'
      ],
      correctOptionIndex: 1,
      explanation: 'The Present-Past-Future framework keeps your answer professional, concise, and focused on relevant skills.'
    },
    {
      title: 'Conflict Resolution',
      type: 'quiz',
      question: 'What is the best way to describe handling a team conflict to an interviewer?',
      options: [
        'Blame the other person to show you were right',
        'Explain how you listened to their perspective, discussed calmly, and found a compromise',
        'State that you never experience conflicts because you ignore disagreements',
        'Report the conflict immediately to upper management without talking to the team member'
      ],
      correctOptionIndex: 1,
      explanation: 'Showing empathy, active listening, and collaboration demonstrates strong teamwork and problem-solving skills.'
    },
    {
      title: 'Salary Negotiation timing',
      type: 'quiz',
      question: 'When is the most strategic time to negotiate your salary during a hiring process?',
      options: [
        'In the initial phone screening call',
        'Before the interview starts',
        'After receiving a formal job offer',
        'On your first day of work'
      ],
      correctOptionIndex: 2,
      explanation: 'You hold the most leverage after the company has selected you as the best candidate and extended a formal offer, but before signing the contract.'
    },
    {
      title: 'Candidate Questions at the end',
      type: 'quiz',
      question: 'At the end of an interview, when the interviewer asks "Do you have any questions for me?", what is the best response?',
      options: [
        '"No, I think we covered everything."',
        'Ask questions about the company culture, team challenges, or their expectations for the role.',
        'Ask how many days of vacation you get immediately.',
        'Ask if you can work from home starting tomorrow.'
      ],
      correctOptionIndex: 1,
      explanation: 'Asking thoughtful questions about the role or company shows that you are genuinely interested, engaged, and evaluating the fit.'
    },
    {
      title: 'Greatest Weakness response',
      type: 'quiz',
      question: 'How should you answer the question "What is your greatest weakness?"',
      options: [
        'Say "I am a perfectionist and work too hard" to mask it as a strength',
        'Share a genuine, non-critical professional weakness and explain the active steps you are taking to improve it',
        'Say "I don\'t have any weaknesses"',
        'Share a personal secret that makes you look unprofessional'
      ],
      correctOptionIndex: 1,
      explanation: 'Interviewers value self-awareness and active growth. Sharing a real weakness and how you are working to fix it demonstrates both.'
    },
    {
      title: 'Why Work Here?',
      type: 'quiz',
      question: 'What is the best approach to answer "Why do you want to work for our company?"',
      options: [
        'Say that you need a job to pay rent',
        'Align the company\'s mission and recent achievements with your personal values and career growth targets',
        'Compliment the recruiter\'s profile page',
        'State that their office building looks close to your home'
      ],
      correctOptionIndex: 1,
      explanation: 'Aligning your skills and aspirations with the company\'s products or culture shows that you have researched the firm and are motivated to contribute.'
    },
    {
      title: 'Elevator Pitch Duration',
      type: 'quiz',
      question: 'What is the recommended duration of a professional elevator pitch?',
      options: ['10-15 seconds', '30-60 seconds', '3-5 minutes', '10 minutes'],
      correctOptionIndex: 1,
      explanation: 'An elevator pitch should be long enough to introduce your core value, but short enough to retain attention—making 30-60 seconds optimal.'
    },
    {
      title: 'Interview Follow-Up',
      type: 'quiz',
      question: 'When is it appropriate to send a thank-you follow-up email after an interview?',
      options: ['Within 2 hours', 'Within 24 hours', 'After 1 week', 'Never, it looks desperate'],
      correctOptionIndex: 1,
      explanation: 'Sending a brief thank-you note within 24 hours reinforces your interest and appreciation for their time.'
    },
    {
      title: 'Active Listening cues',
      type: 'quiz',
      question: 'Which of the following is a key component of active listening during an interview?',
      options: [
        'Interrupting the interviewer to show you know the answer',
        'Nodding, maintaining eye contact, and referencing their points in your replies',
        'Writing down every single word they say',
        'Staring blankly'
      ],
      correctOptionIndex: 1,
      explanation: 'Referencing their questions and maintaining positive body language demonstrates engagement and comprehension.'
    },
    {
      title: 'Resume Focus',
      type: 'quiz',
      question: 'What is the most effective way to describe your past achievements on a resume?',
      options: [
        'Copy-paste the official job description of duties',
        'Use action verbs and quantify your results (e.g. "Increased sales by 15%")',
        'Write long paragraphs explaining your thoughts',
        'List only the names of your managers'
      ],
      correctOptionIndex: 1,
      explanation: 'Quantifiable achievements show the direct impact of your work, providing concrete evidence of your performance.'
    },
    {
      title: 'Behavioral Prep method',
      type: 'quiz',
      question: 'Besides STAR, which acronym describes a method to structure behavioral interview answers?',
      options: ['CAR (Context, Action, Result)', 'PEST (Political, Economic, Social, Tech)', 'SMART (Specific, Measurable, Achievable, Relevant, Timebound)', 'SWOT (Strengths, Weakness, Opp, Threats)'],
      correctOptionIndex: 0,
      explanation: 'CAR stands for Context, Action, and Result. It is a streamlined version of the STAR framework.'
    },
    {
      title: 'Interview attire guidelines',
      type: 'quiz',
      question: 'What is the general guideline for choosing attire for a professional job interview?',
      options: [
        'Dress as casually as possible to look relaxed',
        'Dress one level above the company\'s daily dress code',
        'Always wear a tuxedo or evening gown',
        'Wear whatever is on top of your laundry pile'
      ],
      correctOptionIndex: 1,
      explanation: 'Dressing slightly more formally than the daily standard shows respect for the interviewers and process without being overdressed.'
    },
    {
      title: 'Group Discussion role',
      type: 'quiz',
      question: 'In a group discussion round, what is the best strategy to stand out positively?',
      options: [
        'Speak the loudest and dominate the conversation',
        'Listen actively, summarize points, and encourage quieter members to speak',
        'Agree with everyone without adding points',
        'Remain silent'
      ],
      correctOptionIndex: 1,
      explanation: 'Facilitating collaboration and summarizing show leadership and communication skills, which recruiters look for in group assessments.'
    },
    {
      title: 'Technical walk-through',
      type: 'quiz',
      question: 'In a technical coding interview, what should you do BEFORE writing any code?',
      options: [
        'Start typing immediately to show speed',
        'Clarify the problem requirements, inputs, outputs, and state your planned approach out loud',
        'Ask the interviewer to write the boilerplate',
        'Close the screen'
      ],
      correctOptionIndex: 1,
      explanation: 'Talking through the logic ensures you understand the requirements before coding, saving time on incorrect assumptions.'
    },
    {
      title: 'System Design Tradeoffs',
      type: 'quiz',
      question: 'When asked to design a system, what is the most important concept to discuss?',
      options: [
        'Your favorite programming language syntax',
        'Trade-offs (e.g. latency vs consistency, SQL vs NoSQL)',
        'How cheap the servers are',
        'How fast you can build it'
      ],
      correctOptionIndex: 1,
      explanation: 'All system design choices have tradeoffs. Explaining why you chose one architecture over another shows senior-level engineering maturity.'
    },
    {
      title: 'Online eye contact',
      type: 'quiz',
      question: 'During a remote video interview, how do you simulate eye contact with the interviewer?',
      options: [
        'Look at your keyboard',
        'Look directly into your webcam, not at the browser video window',
        'Look at your background decoration',
        'Close your eyes'
      ],
      correctOptionIndex: 1,
      explanation: 'Looking at the webcam simulates eye contact for the person watching you. Looking down at the screen appears as if you are looking away.'
    },
    {
      title: 'Phone screen target',
      type: 'quiz',
      question: 'What is the primary goal of the initial phone screen round?',
      options: [
        'To negotiate your final contract benefits',
        'To screen basic qualifications, communication skills, and interest alignment',
        'To solve complex architecture designs',
        'To submit references'
      ],
      correctOptionIndex: 1,
      explanation: 'The phone screen is a filter to ensure candidates meet baseline requirements before committing engineering resources to interviews.'
    },
    {
      title: 'Debugging pressure',
      type: 'quiz',
      question: 'If your code fails a test case in a live coding round, what should you do?',
      options: [
        'Panic and close the session',
        'Explain that the test case is wrong',
        'Stay calm, walk through the execution step-by-step with a sample input, and narrate your debugging path',
        'Delete all the code and start over'
      ],
      correctOptionIndex: 2,
      explanation: 'Recruiters want to see how you troubleshoot bugs under pressure. Walking through execution shows logical problem-solving.'
    },
    {
      title: 'Behavioral Star: Action',
      type: 'quiz',
      question: 'In the STAR framework, which section should occupy the majority of your response?',
      options: ['Situation', 'Task', 'Action', 'Result'],
      correctOptionIndex: 2,
      explanation: 'The Action (what you specifically did, how you solved it) is what interviewers evaluate to measure your capabilities.'
    }
  ],
  'GATE': [
    {
      title: 'Operating Systems: Deadlock Prevention',
      type: 'quiz',
      question: 'Which of the following is NOT one of Coffman\'s four necessary conditions for a deadlock to occur?',
      options: [
        'Mutual exclusion',
        'No preemption',
        'Circular wait',
        'Preemptive scheduling'
      ],
      correctOptionIndex: 3,
      explanation: 'The four Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Preemptive scheduling is an OS feature, not a deadlock condition.'
    },
    {
      title: 'Database: ACID transaction',
      type: 'quiz',
      question: 'Which transaction property ensures that all operations in a database transaction are completed successfully or none are?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctOptionIndex: 0,
      explanation: 'Atomicity is the "all-or-nothing" property, ensuring that if any part of the transaction fails, the entire transaction is rolled back.'
    },
    {
      title: 'Compiler: Lexical Analysis',
      type: 'quiz',
      question: 'What is the primary output of the Lexical Analyzer phase in a compiler?',
      options: ['Syntax Tree', 'Intermediate Code', 'Tokens stream', 'Symbol Table'],
      correctOptionIndex: 2,
      explanation: 'The Lexical Analyzer reads source characters and groups them into meaningful sequences called tokens (e.g. keywords, identifiers).'
    },
    {
      title: 'Networks: Subnetting mask',
      type: 'quiz',
      question: 'How many host addresses are available in a Class C subnet with mask /26?',
      options: ['30', '62', '64', '126'],
      correctOptionIndex: 1,
      explanation: '/26 leaves 32 - 26 = 6 bits for hosts. 2^6 = 64 addresses. Subtracting 2 (network and broadcast addresses) leaves 62 available host addresses.'
    },
    {
      title: 'COA: Cache Mapping',
      type: 'quiz',
      question: 'Which cache mapping technique suffers from the conflict miss thrashing issue?',
      options: ['Direct Mapping', 'Fully Associative Mapping', 'Set-Associative Mapping', 'Both Direct and Set-Associative Mapping'],
      correctOptionIndex: 0,
      explanation: 'In Direct Mapping, multiple memory blocks map to the exact same cache line, leading to conflict misses if those blocks are accessed repeatedly.'
    },
    {
      title: 'TOC: Regular Grammars',
      type: 'quiz',
      question: 'Which automaton is used to recognize languages generated by Regular Grammars?',
      options: ['Finite Automata', 'Pushdown Automata', 'Linear Bounded Automata', 'Turing Machine'],
      correctOptionIndex: 0,
      explanation: 'Regular languages/grammars are recognized by Finite Automata (DFA/NFA).'
    },
    {
      title: 'OS: Page Faults',
      type: 'quiz',
      question: 'In demand paging systems, what triggers a Page Fault?',
      options: [
        'A segmentation violation',
        'Accessing a page whose page table entry valid/invalid bit is set to invalid',
        'Running out of physical memory',
        'Dividing by zero'
      ],
      correctOptionIndex: 1,
      explanation: 'A page fault is a hardware interrupt raised when a program accesses a page that is mapped in virtual address space but not loaded in physical RAM.'
    },
    {
      title: 'Algorithms: Masters Theorem',
      type: 'quiz',
      question: 'According to Master\'s Theorem, what is the recurrence complexity of T(n) = 2T(n/2) + O(n)?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
      correctOptionIndex: 1,
      explanation: 'Here a = 2, b = 2, and f(n) = n. Since n^(log_b a) = n^1 = n, this falls into Case 2 of Master\'s theorem, yielding O(n log n).'
    },
    {
      title: 'Digital Logic: Multiplexer select lines',
      type: 'quiz',
      question: 'How many select lines are required for a 16-to-1 Multiplexer?',
      options: ['2', '3', '4', '8'],
      correctOptionIndex: 2,
      explanation: 'A multiplexer with 2^k input lines requires k select lines. 16 = 2^4, so 4 select lines are needed.'
    },
    {
      title: 'Networks: TCP vs UDP',
      type: 'quiz',
      question: 'Which of the following features is NOT provided by UDP?',
      options: ['Checksum verification', 'Flow control and retransmission', 'Port-based demultiplexing', 'Low overhead header'],
      correctOptionIndex: 1,
      explanation: 'UDP is connectionless and does not provide reliability features like flow control, sliding window mechanisms, or packet retransmission.'
    },
    {
      title: 'Software Eng: Coupling & Cohesion',
      type: 'quiz',
      question: 'For high-quality modular software design, which relationship is preferred?',
      options: [
        'High Cohesion and High Coupling',
        'Low Cohesion and Low Coupling',
        'High Cohesion and Low Coupling',
        'Low Cohesion and High Coupling'
      ],
      correctOptionIndex: 2,
      explanation: 'Cohesion measures internal strength of a module (should be high), and Coupling measures inter-dependencies (should be low).'
    },
    {
      title: 'DBMS: Normal Forms BCNF',
      type: 'quiz',
      question: 'A relation R is in Boyce-Codd Normal Form (BCNF) if for every non-trivial functional dependency X -> Y, X is which of the following?',
      options: ['A Primary Key', 'A Super Key', 'A Candidate Key', 'A Prime Attribute'],
      correctOptionIndex: 1,
      explanation: 'BCNF requires that for every functional dependency X -> Y, the determinant X must be a super key.'
    },
    {
      title: 'COA: Pipelining Hazards',
      type: 'quiz',
      question: 'Which pipelining hazard is caused by branch instructions that alter the PC value?',
      options: ['Data Hazard', 'Structural Hazard', 'Control Hazard', 'Dependency Hazard'],
      correctOptionIndex: 2,
      explanation: 'Control hazards (branch hazards) occur when the pipeline cannot fetch the next instruction because the branch target has not been resolved yet.'
    },
    {
      title: 'OS: Semaphores',
      type: 'quiz',
      question: 'If a binary semaphore initialized to 1 receives a wait (P) operation, what does its value become?',
      options: ['0', '1', '2', '-1'],
      correctOptionIndex: 0,
      explanation: 'The wait operation decrements the semaphore. If it is 1, it becomes 0 and the calling thread proceeds.'
    },
    {
      title: 'Discrete Math: Logic',
      type: 'quiz',
      question: 'Which logical connective represents "p implies q" (p -> q) being false?',
      options: [
        'p is true and q is true',
        'p is true and q is false',
        'p is false and q is true',
        'p is false and q is false'
      ],
      correctOptionIndex: 1,
      explanation: 'An implication p -> q is false only if the premise p is true and the conclusion q is false.'
    },
    {
      title: 'Networks: IP Classes',
      type: 'quiz',
      question: 'Which range of first octet values represents Class B IP Addresses?',
      options: ['1-126', '128-191', '192-223', '224-239'],
      correctOptionIndex: 1,
      explanation: 'Class A is 1-126, Class B is 128-191, Class C is 192-223.'
    },
    {
      title: 'TOC: Turing Machine',
      type: 'quiz',
      question: 'Which language family is recognized by Turing Machines?',
      options: ['Regular Languages', 'Context-Free Languages', 'Recursively Enumerable Languages', 'Context-Sensitive Languages only'],
      correctOptionIndex: 2,
      explanation: 'Turing Machines recognize the class of Recursively Enumerable (Type 0) languages.'
    },
    {
      title: 'Compiler: Parsing LL(1)',
      type: 'quiz',
      question: 'An LL(1) parser parses input from left-to-right, constructing which derivation?',
      options: ['Leftmost derivation', 'Rightmost derivation', 'Rightmost derivation in reverse', 'Bottom-up derivation'],
      correctOptionIndex: 0,
      explanation: 'LL(1) stands for Left-to-right, Leftmost derivation with 1 token lookahead.'
    },
    {
      title: 'OS: Disk Scheduling SSTF',
      type: 'quiz',
      question: 'SSTF disk scheduling selects requests based on which criteria?',
      options: [
        'The request closest to the current head position',
        'First-Come, First-Served order',
        'Requests grouped in one direction of sweep',
        'The largest request size'
      ],
      correctOptionIndex: 0,
      explanation: 'Shortest Seek Time First (SSTF) selects the request that requires the minimum cylinder movement from the current head position.'
    },
    {
      title: 'Database: Candidate Keys',
      type: 'quiz',
      question: 'What is a Candidate Key in a database table?',
      options: [
        'Any column that contains nulls',
        'A minimal set of attributes that uniquely identifies a tuple',
        'A key that points to another table\'s primary key',
        'The key selected by the DBA for indexing'
      ],
      correctOptionIndex: 1,
      explanation: 'A candidate key is a super key with no redundant attributes; it is a minimal unique identifier.'
    }
  ],
  'UPSC': [
    {
      title: 'Polity: Preamble Values',
      type: 'quiz',
      question: 'Which amendment to the Constitution of India added the words "Socialist", "Secular", and "Integrity" to the Preamble?',
      options: ['24th Amendment', '38th Amendment', '42nd Amendment', '44th Amendment'],
      correctOptionIndex: 2,
      explanation: 'The 42nd Constitutional Amendment Act of 1976 amended the Preamble to insert Socialist, Secular, and Integrity.'
    },
    {
      title: 'Polity: Fundamental Rights',
      type: 'quiz',
      question: 'Which Article of the Indian Constitution guarantees the "Right to Equality"?',
      options: ['Articles 14-18', 'Articles 19-22', 'Articles 23-24', 'Articles 25-28'],
      correctOptionIndex: 0,
      explanation: 'The Right to Equality is covered under Articles 14 to 18 of the Indian Constitution.'
    },
    {
      title: 'Polity: DPSP Source',
      type: 'quiz',
      question: 'The Directive Principles of State Policy (DPSP) in the Indian Constitution were borrowed from the constitution of which country?',
      options: ['USA', 'USSR', 'Ireland', 'Australia'],
      correctOptionIndex: 2,
      explanation: 'The framers of the Constitution borrowed the DPSPs from the Irish Constitution, which had copied them from Spain.'
    },
    {
      title: 'Polity: President Impeachment',
      type: 'quiz',
      question: 'Under which Article can the President of India be impeached for violation of the Constitution?',
      options: ['Article 52', 'Article 61', 'Article 72', 'Article 356'],
      correctOptionIndex: 1,
      explanation: 'Article 61 of the Constitution of India prescribes the procedure for the impeachment of the President.'
    },
    {
      title: 'History: Indus Valley',
      type: 'quiz',
      question: 'Which Indus Valley site is famous for the discovery of a dockyard?',
      options: ['Harappa', 'Mohenjo-daro', 'Lothal', 'Kalibangan'],
      correctOptionIndex: 2,
      explanation: 'Lothal in Gujarat had a massive tidal dockyard, proving trade connections with ancient civilizations.'
    },
    {
      title: 'History: Mauryas governance',
      type: 'quiz',
      question: 'Who was the Prime Minister of Chandragupta Maurya and author of the text Arthashastra?',
      options: ['Megasthenes', 'Chanakya (Kautilya)', 'Bimbisara', 'Ashoka'],
      correctOptionIndex: 1,
      explanation: 'Chanakya (Kautilya) was the Prime Minister who helped Chandragupta establish the Maurya Empire and authored the political treatise Arthashastra.'
    },
    {
      title: 'History: Gupta Period literature',
      type: 'quiz',
      question: 'Who wrote the famous sanskrit play Abhijnanasakuntalam during the Gupta period?',
      options: ['Kalidasa', 'Harisena', 'Vishakhadatta', 'Sudraka'],
      correctOptionIndex: 0,
      explanation: 'Kalidasa, one of the nine gems (Navaratnas) of Vikramaditya, wrote Abhijnanasakuntalam, Meghaduta, and Raghuvamsa.'
    },
    {
      title: 'History: National Movement INC',
      type: 'quiz',
      question: 'In which year was the Indian National Congress (INC) founded?',
      options: ['1857', '1885', '1905', '1919'],
      correctOptionIndex: 1,
      explanation: 'The INC was founded in December 1885 at Bombay by retired civil servant A.O. Hume.'
    },
    {
      title: 'History: Non-Cooperation Movement',
      type: 'quiz',
      question: 'Why did Mahatma Gandhi call off the Non-Cooperation Movement in 1922?',
      options: [
        'Due to the Jallianwala Bagh massacre',
        'Due to the Chauri Chaura violent incident',
        'Because the British accepted all demands',
        'Due to health issues'
      ],
      correctOptionIndex: 1,
      explanation: 'Following the Chauri Chaura incident where a mob set fire to a police station burning 22 policemen, Gandhi suspended the movement due to his commitment to non-violence.'
    },
    {
      title: 'History: Quit India Movement',
      type: 'quiz',
      question: 'In which year did the Quit India Movement launch, calling for "Do or Die"?',
      options: ['1930', '1940', '1942', '1946'],
      correctOptionIndex: 2,
      explanation: 'The Quit India Movement was launched by Mahatma Gandhi in August 1942 at the Bombay session of the AICC.'
    },
    {
      title: 'Geography: Monsoon winds',
      type: 'quiz',
      question: 'Which winds bring the majority of rainfall to the Indian subcontinent during June to September?',
      options: ['North-East Monsoon', 'South-West Monsoon', 'Western Disturbances', 'Trade Winds'],
      correctOptionIndex: 1,
      explanation: 'The South-West Monsoon winds blow from the Indian Ocean over the subcontinent, bringing heavy rain.'
    },
    {
      title: 'Geography: Rivers of India',
      type: 'quiz',
      question: 'Which river is known as the "Dakshin Ganga" (Ganges of the South)?',
      options: ['Krishna', 'Kaveri', 'Godavari', 'Narmada'],
      correctOptionIndex: 2,
      explanation: 'The Godavari is the largest peninsular river and is termed Dakshin Ganga due to its length and area coverage.'
    },
    {
      title: 'Economy: Inflation control',
      type: 'quiz',
      question: 'Which organization in India is responsible for regulating monetary policy and controlling inflation?',
      options: ['Ministry of Finance', 'SEBI', 'Reserve Bank of India (RBI)', 'NITI Aayog'],
      correctOptionIndex: 2,
      explanation: 'The RBI utilizes repo rate adjustments and Cash Reserve Ratio parameters to control money supply and inflation.'
    },
    {
      title: 'Economy: Budget presentation',
      type: 'quiz',
      question: 'Under which Constitutional Article is the Union Budget (Annual Financial Statement) presented in the Parliament?',
      options: ['Article 110', 'Article 112', 'Article 280', 'Article 360'],
      correctOptionIndex: 1,
      explanation: 'Article 112 of the Constitution of India deals with the Annual Financial Statement (Budget).'
    },
    {
      title: 'Polity: Panchayati Raj',
      type: 'quiz',
      question: 'Which constitutional amendment acts gave constitutional status to rural and urban local self-governments?',
      options: ['42nd and 44th', '73rd and 74th', '86th and 91st', '97th and 99th'],
      correctOptionIndex: 1,
      explanation: 'The 73rd and 74th Amendments of 1992 inserted Part IX (Panchayats) and Part IXA (Municipalities) into the Constitution.'
    },
    {
      title: 'Polity: Judicial Review',
      type: 'quiz',
      question: 'Judicial Review in India is based on which principle?',
      options: ['Procedure established by law', 'Due process of law', 'Rule of Law', 'Precedents and Conventions'],
      correctOptionIndex: 0,
      explanation: 'The power of Judicial Review in India is primarily based on the "Procedure established by law" (Article 21), though courts have expanded this to approximate "Due process of law".'
    },
    {
      title: 'Economy: GST Council Chair',
      type: 'quiz',
      question: 'Who is the ex-officio chairperson of the GST Council in India?',
      options: ['The Prime Minister', 'The Union Finance Minister', 'The Governor of RBI', 'The Union Commerce Secretary'],
      correctOptionIndex: 1,
      explanation: 'The GST Council is a constitutional body chaired by the Union Finance Minister.'
    },
    {
      title: 'Environment: SDGs target year',
      type: 'quiz',
      question: 'What is the target year set by the United Nations to achieve the Sustainable Development Goals (SDGs)?',
      options: ['2025', '2030', '2035', '2040'],
      correctOptionIndex: 1,
      explanation: 'The UN SDGs (17 goals) were adopted in 2015 with a target completion agenda set for 2030.'
    },
    {
      title: 'History: Ashoka Edicts',
      type: 'quiz',
      question: 'In which script were the majority of Ashoka\'s inscriptions written in the sub-continent?',
      options: ['Brahmi', 'Kharosthi', 'Greek', 'Aramaic'],
      correctOptionIndex: 0,
      explanation: 'The majority of Ashoka\'s edicts were written in Prakrit language using the Brahmi script.'
    },
    {
      title: 'Polity: Parliament composition',
      type: 'quiz',
      question: 'The Parliament of India consists of which of the following?',
      options: [
        'Lok Sabha and Rajya Sabha only',
        'Lok Sabha, Rajya Sabha, and the President of India',
        'Lok Sabha, Prime Minister, and Cabinet',
        'Lok Sabha, Rajya Sabha, and the Supreme Court Justices'
      ],
      correctOptionIndex: 1,
      explanation: 'Under Article 79, the Parliament of the Union consists of the President and the two Houses (Rajya Sabha and Lok Sabha).'
    }
  ],
  'Mathematics': [
    {
      title: 'Linear Algebra: Determinants',
      type: 'quiz',
      question: 'What is the determinant of a 2x2 matrix: [[a, b], [c, d]]?',
      options: ['ab - cd', 'ad - bc', 'ac - bd', 'ad + bc'],
      correctOptionIndex: 1,
      explanation: 'The determinant of a 2x2 matrix is calculated as det = ad - bc.'
    },
    {
      title: 'Calculus: Derivatives',
      type: 'quiz',
      question: 'What is the derivative of f(x) = sin(x) with respect to x?',
      options: ['cos(x)', '-cos(x)', 'tan(x)', 'sec²(x)'],
      correctOptionIndex: 0,
      explanation: 'The derivative of sin(x) is cos(x). The derivative of cos(x) is -sin(x).'
    },
    {
      title: 'Probability: Bayes Theorem',
      type: 'quiz',
      question: 'Bayes\' Theorem calculates which type of probability?',
      options: ['Joint Probability', 'Marginal Probability', 'Conditional Probability', 'Independent Probability'],
      correctOptionIndex: 2,
      explanation: 'Bayes\' Theorem calculates conditional (posterior) probability: P(A|B) = P(B|A) * P(A) / P(B).'
    },
    {
      title: 'Linear Algebra: Eigenvalues',
      type: 'quiz',
      question: 'Eigenvalues λ of a square matrix A satisfy which characteristic equation?',
      options: ['det(A - λI) = 0', 'trace(A) = λ', 'A * λ = I', 'det(λI) = A'],
      correctOptionIndex: 0,
      explanation: 'The eigenvalues λ are the roots of the characteristic polynomial det(A - λI) = 0, where I is the identity matrix.'
    },
    {
      title: 'Calculus: Integration by Parts',
      type: 'quiz',
      question: 'What is the formula for Integration by Parts: ∫ u dv?',
      options: [
        'uv - ∫ v du',
        'uv + ∫ v du',
        'u du - v dv',
        'v du - u dv'
      ],
      correctOptionIndex: 0,
      explanation: 'Integration by parts is derived from the product rule: ∫ u dv = uv - ∫ v du.'
    },
    {
      title: 'Differential Equations: Order',
      type: 'quiz',
      question: 'What is the order of the differential equation: (d²y/dx²)³ + dy/dx + y = 0?',
      options: ['1', '2', '3', '0'],
      correctOptionIndex: 1,
      explanation: 'The order is determined by the highest derivative present (d²y/dx²), which is 2. The degree is the power of the highest derivative, which is 3.'
    },
    {
      title: 'Probability: Normal Distribution',
      type: 'quiz',
      question: 'What percentage of data falls within one standard deviation (±1σ) of the mean in a standard normal distribution?',
      options: ['50%', '68.2%', '95.4%', '99.7%'],
      correctOptionIndex: 1,
      explanation: 'According to the empirical rule, approximately 68.2% of observations fall within ±1 standard deviation of the mean.'
    },
    {
      title: 'Sequences: Geometric Progression',
      type: 'quiz',
      question: 'What is the sum to infinity of a geometric progression with first term a and common ratio r (where |r| < 1)?',
      options: ['a / (1 - r)', 'a * r^n', 'a / (1 + r)', 'a * (1 - r)'],
      correctOptionIndex: 0,
      explanation: 'The sum of an infinite geometric series converges to S = a / (1 - r) if the absolute value of common ratio is less than 1.'
    },
    {
      title: 'Permutations with duplicate letters',
      type: 'quiz',
      question: 'How many unique arrangements can be made from the letters of the word "BALL"?',
      options: ['6', '12', '24', '48'],
      correctOptionIndex: 1,
      explanation: 'The word has 4 letters with one duplicate (L). Arrangements = 4! / 2! = 24 / 2 = 12.'
    },
    {
      title: 'Vectors: Dot Product',
      type: 'quiz',
      question: 'If the dot product of two vectors is zero, what is the angle between them?',
      options: ['0 degrees', '45 degrees', '90 degrees', '180 degrees'],
      correctOptionIndex: 2,
      explanation: 'A · B = |A||B| cos(θ). If A · B = 0, then cos(θ) = 0, meaning the vectors are perpendicular (90 degrees).'
    },
    {
      title: 'Complex Numbers: Polar Form',
      type: 'quiz',
      question: 'What is the polar form of the complex number z = x + iy?',
      options: ['r(cos θ + i sin θ)', 'r(sin θ + i cos θ)', 'r e^(i+θ)', 'r tan θ'],
      correctOptionIndex: 0,
      explanation: 'Euler\'s formula maps complex coordinates to polar form: z = r(cos θ + i sin θ) where r is modulus and θ is argument.'
    },
    {
      title: 'Set Theory: Intersection',
      type: 'quiz',
      question: 'If Set A = {1, 2, 3} and Set B = {3, 4, 5}, what is A ∩ B?',
      options: ['{1, 2, 3, 4, 5}', '{3}', '{1, 2, 4, 5}', '{}'],
      correctOptionIndex: 1,
      explanation: 'The intersection (∩) contains only elements present in both sets, which is {3}.'
    },
    {
      title: 'Quadratic Equations roots',
      type: 'quiz',
      question: 'For a quadratic equation ax² + bx + c = 0, what is the sum of the roots?',
      options: ['c/a', '-b/a', 'b/a', '-c/a'],
      correctOptionIndex: 1,
      explanation: 'According to Vieta\'s formulas, the sum of roots is -b/a and the product of roots is c/a.'
    },
    {
      title: 'Trigonometric identities',
      type: 'quiz',
      question: 'Which of the following is equivalent to: sin²(θ) + cos²(θ)?',
      options: ['0', '1', 'tan²(θ)', 'sec²(θ)'],
      correctOptionIndex: 1,
      explanation: 'This is the fundamental Pythagorean trigonometric identity: sin²(θ) + cos²(θ) = 1.'
    },
    {
      title: 'Functions Surjective definition',
      type: 'quiz',
      question: 'A function f: X -> Y is surjective (onto) if which condition is met?',
      options: [
        'Every element in X maps to a unique element in Y',
        'The range of f is equal to the codomain Y',
        'The function has an inverse',
        'The function is differentiable'
      ],
      correctOptionIndex: 1,
      explanation: 'A function is surjective (onto) if every element in the codomain Y is mapped to by at least one element in the domain X.'
    },
    {
      title: 'Calculus: Limits',
      type: 'quiz',
      question: 'What is the limit of sin(x) / x as x approaches 0?',
      options: ['0', '1', 'Undefined', 'Infinity'],
      correctOptionIndex: 1,
      explanation: 'This is a standard trigonometric limit, proved via Squeeze theorem or L\'Hopital\'s rule: lim (x->0) sin(x)/x = 1.'
    },
    {
      title: 'Calculus: Integral of 1/x',
      type: 'quiz',
      question: 'What is the indefinite integral of f(x) = 1/x for x > 0?',
      options: ['ln(x) + C', 'x^0 + C', '-1/x² + C', 'e^x + C'],
      correctOptionIndex: 0,
      explanation: 'The integral of 1/x is natural log: ∫ 1/x dx = ln|x| + C.'
    },
    {
      title: 'Statistics: Median calculation',
      type: 'quiz',
      question: 'What is the median of the following set of numbers: 3, 11, 7, 5, 9?',
      options: ['5', '7', '9', '7.5'],
      correctOptionIndex: 1,
      explanation: 'First sort the numbers: 3, 5, 7, 9, 11. The middle number is 7, which is the median.'
    },
    {
      title: 'Taylor series center',
      type: 'quiz',
      question: 'A Maclaurin series is a Taylor series expansion of a function about which point?',
      options: ['x = 0', 'x = 1', 'x = pi', 'x = e'],
      correctOptionIndex: 0,
      explanation: 'A Maclaurin series is defined as a Taylor series expansion centered at x = 0.'
    },
    {
      title: 'Linear Algebra: Transpose property',
      type: 'quiz',
      question: 'For two matrices A and B, what is the transpose property of their product (AB)^T?',
      options: ['A^T * B^T', 'B^T * A^T', '(A * B)^T', 'A^T * B'],
      correctOptionIndex: 1,
      explanation: 'The transpose of a matrix product reverses the order: (AB)^T = B^T * A^T.'
    }
  ]
};
