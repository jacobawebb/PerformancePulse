# ProcessorPulse

## Description
ProcessorPulse is a comprehensive CPU benchmarking tool that evaluates single-threaded and multi-threaded performance, as well as memory access speed. Customize test parameters and get detailed results saved to a text file for easy comparison. Run multiple tests to ensure accuracy and consistency.

## Features
- **Single-Threaded Performance**: Measures the CPU's efficiency in handling single-threaded tasks using Fibonacci calculations.
- **Multi-Threaded Performance**: Evaluates the CPU's multi-threading capabilities through prime number calculations.
- **Memory Access Speed**: Assesses the speed of memory access operations to provide a complete performance profile.
- **Detailed Configuration**: Allows customization of test parameters to suit different benchmarking needs.
- **Progress Feedback**: Displays real-time progress, iteration counts, and timers for each test.
- **Comprehensive Results**: Stores detailed benchmark results in a text file for easy comparison.

## Usage
1. Clone the repository:
   ```bash
   git clone https://github.com/jacobawebb/ProcessorPulse.git
   ```
2. Navigate to the project directory:
   ```bash
   cd ProcessorPulse
   ```
3. Run the benchmarking tool:
   ```bash
   node benchmark.js
   ```

## Configuration
Customize the benchmarking tests by modifying the `CONFIG` object in `benchmark.js`:
```javascript
const CONFIG = {
    fibTest: {
        iterations: 40, // Number of Fibonacci calculations
        depth: 30,      // Depth of Fibonacci calculation
        runs: 5         // Number of times to run the test for averaging
    },
    primeTest: {
        limit: 100000,  // Upper limit for prime number calculation
        runs: 5,        // Number of times to run the test for averaging
    },
    memoryTest: {
        size: 100 * 1024 * 1024, // Size of the memory buffer to test in bytes
        runs: 5,                 // Number of times to run the test for averaging
    }
};
```

## Contributions
Contributions are welcome! Feel free to open an issue or submit a pull request with any improvements or suggestions.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
