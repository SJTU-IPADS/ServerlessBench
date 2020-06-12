This test case evaluate startup times with different function sizes.

The `aws-*.zip` packages are function packages of different sizes that can be tested on AWS Lambda.

The function handlers of `aws-pkg*.zip` packages are defined in the corresponding `aws_pkg*.py` files.

The function handlers of `aws-size*.zip` packages are defined in `aws_size.py` file, in which case the dependencies are included in the function packages, but not imported in function handler codes (redundant dependencies).

The different package sizes are constructed by packing the handler codes with different numbers of dependency packages. 

Specifically, four popular PyPl packages (`mypy`, `numpy`, `django`, and `sphinx`) are used, producing function packages of sizes:
* 22.7MB -- with `mypy`;
* 44.1MB -- with `mypy` and `numpy`;
* 54.4MB -- with `mypy`, `numpy`, and `django`;
* 72.6MB -- with `mypy`, `numpy`, `django`, and `sphinx`.

To construct the packages yourself or use other packages, please refer to the [AWS Guide](https://docs.aws.amazon.com/lambda/latest/dg/python-package.html) for instructions.
