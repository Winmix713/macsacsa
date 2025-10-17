from setuptools import setup, find_packages

setup(
    name="winmix-backtest",
    version="0.1.0",
    description="Spanish Liga Pattern-First Engine with Backtesting",
    author="Pattern Analysis Team",
    packages=find_packages(where="src"),
    package_dir={"": "src"},
    python_requires=">=3.8",
    entry_points={
        'console_scripts': [
            'winmix-backtest=winmix.cli:main',
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
