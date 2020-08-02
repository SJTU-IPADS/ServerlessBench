We conclude the recommended platform for different applications based on our evaluation using serverlessBench.

The platforms we compared include AWS Lambda, OpenWhisk, and Fn Project.

| Application behavior | Suitable platforms  |
|---|---|
| with parallelizable phase |   |
| with long function chain |   |
| with low request frequency (cold start-dominate)  |   |
| with low request frequency (warm start-dominate)  |   |
| with inter-function payload larger than 32KB  | OpenWhisk/Fn  |
| with sequence chain  |   |
| with large function code size  |   |
| with high concurrency  | Fn |
| with valuable implicit states  |   |