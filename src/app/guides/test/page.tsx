import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoPersonOutline,
  IoCheckmarkCircleOutline,
  IoCodeSlashOutline
} from "react-icons/io5";

export const metadata = {
  title: "Test Guide | Sean Filimon",
  description: "A comprehensive guide on testing best practices and implementation strategies.",
};

export default function TestGuidePage() {
  return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <Button variant="outline" asChild className="rounded-sm">
            <Link href="/guides" className="flex items-center gap-2">
              <IoArrowBackOutline className="h-4 w-4" />
              Back to Guides
            </Link>
          </Button>
        </div>

        {/* Hero Section */}
        <div className="mb-12">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border mb-6">
            <Image
              src="/bg-pattern.png"
              alt="Test Guide Cover"
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <IoPersonOutline className="h-4 w-4" />
                <span>Sean Filimon</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IoCalendarOutline className="h-4 w-4" />
                <span>November 2024</span>
              </div>
              <div className="flex items-center gap-1.5">
                <IoTimeOutline className="h-4 w-4" />
                <span>15 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold">
              Complete Guide to Modern Testing Practices
            </h1>

            <p className="text-xl text-muted-foreground">
              Learn how to implement comprehensive testing strategies in modern web applications, 
              from unit tests to end-to-end testing.
            </p>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-sm">
                Testing
              </span>
              <span className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-sm">
                Best Practices
              </span>
              <span className="px-3 py-1 text-sm bg-accent text-accent-foreground rounded-sm">
                Development
              </span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 p-6 border rounded-lg bg-muted/5">
          <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
          <ol className="space-y-2 text-sm">
            <li><a href="#introduction" className="text-primary hover:underline">1. Introduction</a></li>
            <li><a href="#types-of-tests" className="text-primary hover:underline">2. Types of Tests</a></li>
            <li><a href="#setting-up" className="text-primary hover:underline">3. Setting Up Your Testing Environment</a></li>
            <li><a href="#unit-testing" className="text-primary hover:underline">4. Unit Testing</a></li>
            <li><a href="#integration-testing" className="text-primary hover:underline">5. Integration Testing</a></li>
            <li><a href="#e2e-testing" className="text-primary hover:underline">6. End-to-End Testing</a></li>
            <li><a href="#best-practices" className="text-primary hover:underline">7. Best Practices</a></li>
            <li><a href="#conclusion" className="text-primary hover:underline">8. Conclusion</a></li>
          </ol>
        </div>

        {/* Guide Content */}
        <article className="prose prose-invert max-w-none">
          <section id="introduction" className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Introduction</h2>
            <p className="text-muted-foreground mb-4">
              Testing is a critical part of modern software development. It helps ensure your code works as expected, 
              catches bugs early, and gives you confidence when making changes. In this guide, we&apos;ll explore 
              different types of testing and how to implement them in your projects.
            </p>
            <p className="text-muted-foreground">
              Whether you&apos;re building a small personal project or a large-scale application, having a solid 
              testing strategy will save you time, reduce bugs, and improve code quality.
            </p>
          </section>

          <section id="types-of-tests" className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Types of Tests</h2>
            <div className="space-y-6">
              <div className="p-4 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500" />
                  Unit Tests
                </h3>
                <p className="text-muted-foreground">
                  Test individual functions or components in isolation. Fast, focused, and form the foundation of your test suite.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="h-5 w-5 text-blue-500" />
                  Integration Tests
                </h3>
                <p className="text-muted-foreground">
                  Test how multiple units work together. Verify that different parts of your application interact correctly.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  <IoCheckmarkCircleOutline className="h-5 w-5 text-purple-500" />
                  End-to-End Tests
                </h3>
                <p className="text-muted-foreground">
                  Test complete user flows from start to finish. Simulate real user interactions with your application.
                </p>
              </div>
            </div>
          </section>

          <section id="setting-up" className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Setting Up Your Testing Environment</h2>
            <p className="text-muted-foreground mb-4">
              Before writing tests, you need to set up your testing environment. Here&apos;s what you&apos;ll need:
            </p>
            
            <div className="p-4 border rounded-lg bg-muted/10 mb-4">
              <div className="flex items-start gap-3 mb-2">
                <IoCodeSlashOutline className="h-5 w-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold mb-2">Install Testing Dependencies</h4>
                  <pre className="p-3 bg-background rounded text-sm overflow-x-auto">
                    <code>npm install --save-dev vitest @testing-library/react @testing-library/jest-dom</code>
                  </pre>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground">
              This installs Vitest (fast unit test framework), React Testing Library (for component testing), 
              and jest-dom (useful matchers for DOM assertions).
            </p>
          </section>

          <section id="unit-testing" className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Unit Testing</h2>
            <p className="text-muted-foreground mb-4">
              Unit tests are the most granular tests you&apos;ll write. They test individual functions or components in complete isolation.
            </p>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Example: Testing a Utility Function</h4>
                <pre className="p-4 bg-muted/10 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`// utils/calculator.ts
export function add(a: number, b: number): number {
  return a + b;
}

// utils/calculator.test.ts
import { describe, it, expect } from 'vitest';
import { add } from './calculator';

describe('add function', () => {
  it('should add two positive numbers', () => {
    expect(add(2, 3)).toBe(5);
  });
  
  it('should handle negative numbers', () => {
    expect(add(-1, -1)).toBe(-2);
  });
});`}</code>
                </pre>
              </div>
            </div>
          </section>

          <section id="best-practices" className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Best Practices</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                  <strong>Write tests first</strong> - Consider Test-Driven Development (TDD) for critical features
                </div>
              </li>
              <li className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                  <strong>Keep tests focused</strong> - Each test should verify one specific behavior
                </div>
              </li>
              <li className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                  <strong>Use descriptive names</strong> - Test names should clearly describe what they&apos;re testing
                </div>
              </li>
              <li className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                  <strong>Maintain test independence</strong> - Tests shouldn&apos;t depend on each other&apos;s execution
                </div>
              </li>
              <li className="flex items-start gap-3">
                <IoCheckmarkCircleOutline className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                <div>
                  <strong>Mock external dependencies</strong> - Isolate the code you&apos;re testing from external services
                </div>
              </li>
            </ul>
          </section>

          <section id="conclusion" className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Conclusion</h2>
            <p className="text-muted-foreground mb-4">
              Testing is an investment in your codebase&apos;s future. While it takes time upfront, it pays dividends 
              by catching bugs early, enabling confident refactoring, and serving as living documentation for your code.
            </p>
            <p className="text-muted-foreground">
              Start small with unit tests for critical business logic, then gradually expand your test coverage. 
              Remember: some tests are better than no tests, and perfect is the enemy of good.
            </p>
          </section>
        </article>

        {/* Next/Previous Navigation */}
        <div className="mt-12 pt-8 border-t flex items-center justify-between">
          <Button variant="outline" asChild className="rounded-sm">
            <Link href="/guides" className="flex items-center gap-2">
              <IoArrowBackOutline className="h-4 w-4" />
              All Guides
            </Link>
          </Button>
          
          <Button asChild className="rounded-sm">
            <Link href="/guides/advanced-testing">
              Next Guide
              <IoArrowBackOutline className="h-4 w-4 rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

