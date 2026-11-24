
export type Example = {
  name: string
  code: string
  input?: string
}

export const examples: Record<string, Example[]> = {

  c: [

    {
      name: 'Hello World',
      code: `#include <stdio.h>

int main() {
    printf("Hello World");
    return 0;
}`
    },

    {
      name: 'Addition of Two Numbers',
      code: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("Sum = %d", a+b);
    return 0;
}`,
      input: '10 20'
    },

    {
      name: 'Even or Odd',
      code: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    if(n % 2 == 0)
        printf("Even");
    else
        printf("Odd");

    return 0;
}`,
      input: '10'
    },

    {
      name: 'Greater of Two Numbers',
      code: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);

    if(a > b)
        printf("%d is greater", a);
    else if(b > a)
        printf("%d is greater", b);
    else
        printf("Both are equal");

    return 0;
}`,
      input: '25 15'
    },

    {
      name: 'Swap Two Numbers',
      code: `#include <stdio.h>

int main() {
    int a = 10, b = 20, temp;

    temp = a;
    a = b;
    b = temp;

    printf("a = %d, b = %d", a, b);
    return 0;
}`
    },

    {
      name: 'Factorial',
      code: `#include <stdio.h>

int main() {
    int n, i, fact = 1;
    scanf("%d", &n);

    if(n < 0 || n > 12) {
        printf("Enter a number from 0 to 12");
        return 1;
    }

    for(i = 1; i <= n; i++) {
        fact = fact * i;
    }

    printf("Factorial = %d", fact);
    return 0;
}`,
      input: '5'
    },

    {
      name: 'Fibonacci Series',
      code: `#include <stdio.h>

int main() {
    int a = 0, b = 1, c, i;

    for(i = 0; i < 10; i++) {
        printf("%d ", a);
        c = a + b;
        a = b;
        b = c;
    }

    return 0;
}`
    },

    {
      name: 'Reverse a Number',
      code: `#include <stdio.h>

int main() {
    int n = 12345, reverse = 0;

    while(n != 0) {
        reverse = reverse * 10 + n % 10;
        n = n / 10;
    }

    printf("Reverse = %d", reverse);
    return 0;
}`
    },

    {
      name: 'Palindrome Number',
      code: `#include <stdio.h>

int main() {
    int n = 121;
    int original = n;
    int reverse = 0;

    while(n != 0) {
        reverse = reverse * 10 + n % 10;
        n = n / 10;
    }

    if(original == reverse)
        printf("Palindrome");
    else
        printf("Not Palindrome");

    return 0;
}`
    },

    {
      name: 'Array Traversal',
      code: `#include <stdio.h>

int main() {
    int arr[5] = {10, 20, 30, 40, 50};

    for(int i = 0; i < 5; i++) {
        printf("%d ", arr[i]);
    }

    return 0;
}`
    },

    {
      name: 'Functions',
      code: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    printf("Sum = %d", add(10, 20));
    return 0;
}`
    },

    {
      name: 'Pointers',
      code: `#include <stdio.h>

int main() {
    int a = 10;
    int *p = &a;

    printf("Value = %d", *p);
    return 0;
}`
    },

    {
      name: 'Structure',
      code: `#include <stdio.h>

struct Student {
    int roll;
    float marks;
};

int main() {
    struct Student s = {101, 95.5};

    printf("Roll = %d", s.roll);
    printf(" Marks = %.2f", s.marks);

    return 0;
}`
    },

    {
      name: 'String Length',
      code: `#include <stdio.h>

int main() {
    char str[] = "VYRON";
    int length = 0;

    while(str[length] != '\\0') {
        length++;
    }

    printf("Length = %d", length);
    return 0;
}`
    }

  ],

  cpp: [
    {
      name: 'Hello World',
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello World";
    return 0;
}`
    },

    {
      name: 'Addition',
      code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    cout << a+b;
    return 0;
}`,
      input: '10 20'
    }
  ],

  python: [
    {
      name: 'Hello World',
      code: `print("Hello World")`
    },

    {
      name: 'Addition',
      code: `a = int(input())
b = int(input())

print("Sum =", a+b)`,
      input: '10\n20'
    },

    {
      name: 'For Loop',
      code: `for i in range(1, 11):
    print(i)`
    }
  ],

  java: [
    {
      name: 'Hello World',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`
    }
  ],

  javascript: [
    {
      name: 'Hello World',
      code: `console.log("Hello World");`
    },

    {
      name: 'Addition',
      code: `let a = 10;
let b = 20;

console.log("Sum =", a+b);`
    }
  ],

  csharp: [
    {
      name: 'Hello World',
      code: `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello World");
    }
}`
    }
  ],

  go: [
    {
      name: 'Hello World',
      code: `package main

import "fmt"

func main() {
    fmt.Println("Hello World")
}`
    }
  ],

  rust: [
    {
      name: 'Hello World',
      code: `fn main() {
    println!("Hello World");
}`
    }
  ],

  php: [
    {
      name: 'Hello World',
      code: `<?php
echo "Hello World";
?>`
    }
  ],

  ruby: [
    {
      name: 'Hello World',
      code: `puts "Hello World"`
    }
  ],

  kotlin: [
    {
      name: 'Hello World',
      code: `fun main() {
    println("Hello World")
}`
    }
  ],

  swift: [
    {
      name: 'Hello World',
      code: `print("Hello World")`
    }
  ],

  typescript: [
    {
      name: 'Hello World',
      code: `const message: string = "Hello World";
console.log(message);`
    }
  ],

  lua: [
    {
      name: 'Hello World',
      code: `print("Hello World")`
    }
  ],

  r: [
    {
      name: 'Hello World',
      code: `print("Hello World")`
    }
  ]

}
