# Code Review & Refactoring Guide (.NET/C#)

Use after code works. For workflow/branches see [workflow-guide.md](workflow-guide.md).

## When to Review/Refactor

| Situation | Action |
|-----------|--------|
| Feature works | Review before moving on |
| Messy code | Refactor now |
| Adding to old code | Review first |
| Found bug | Check surrounding code |

## SOLID Principles

| Principle | Check |
|-----------|-------|
| **SRP** | One reason to change? |
| **OCP** | Extend without modify? |
| **LSP** | Derived substitutes base? |
| **ISP** | Small focused interfaces? |
| **DIP** | Depends on abstractions? |

**Red Flags:** 500+ line class, 50+ line method, "Manager/Helper/Utility" names, 5+ parameters, 5+ constructor dependencies

## Naming (Microsoft Style)

| Element | Convention | Example |
|---------|------------|---------|
| Classes/Interfaces | PascalCase | `CustomerService`, `IRepository` |
| Methods | PascalCase | `GetById()` |
| Properties | PascalCase | `FirstName` |
| Private fields | _camelCase | `_repository` |
| Variables/params | camelCase | `orderId` |
| Constants | PascalCase | `MaxRetries` |
| Async methods | +Async | `GetAsync()` |

**Rules:** Reveal intent (`GetActiveCustomers` not `GetData`), no abbreviations, be consistent

## Code Quality Checks

**Async:** Use `await` (not `.Result`/`.Wait()`), pass `CancellationToken`, use `Task.WhenAll` for parallel

**Exceptions:** Catch specific types, preserve info when rethrowing, log context, use `using` for IDisposable

**DI:** Inject dependencies (no `new`), correct lifetime (Singleton/Scoped/Transient), depend on interfaces

**Performance:** Appropriate LINQ usage, watch allocations, optimize DB queries (N+1), StringBuilder in loops

## Architecture

| Check | Question |
|-------|----------|
| Coupling | Loosely coupled? Replaceable? |
| Cohesion | Related things together? |
| Testability | Easy to unit test? |
| Extensibility | Add features without modifying? |

**Before large changes ask:** How does this look in 6 months? More or less complexity? Understandable after break? What breaks if changed? Right layer?

**Patterns:** Factory/Builder (creation), Adapter/Decorator (structure), Strategy/Observer (behavior)

## Security

- [ ] Input validated?
- [ ] SQL parameterized?
- [ ] Secrets secure (User Secrets/Key Vault)?
- [ ] Sensitive data logged properly?
- [ ] Auth checks in place?

## Test Coverage

| Type | Min | Target |
|------|-----|--------|
| Business | 80% | 90%+ |
| Data | 70% | 80% |
| API | 60% | 70% |
| UI | 50% | 60% |

**Quality > quantity.** 100% coverage ≠ bug-free.

**Test checklist:** Meaningful assertions? Edge cases? Descriptive name? Independent? Fails if code wrong?

**Anti-patterns:**
```csharp
// ❌ No assertion
service.Process(order); // No Assert!

// ❌ Tests implementation
_mock.Verify(r => r.GetById(It.IsAny<int>()));

// ✅ Tests behavior
var result = _service.Get(123);
Assert.Equal(123, result.Id);
```

## Code Smells → Solutions

| Smell | Fix |
|-------|-----|
| Long method (50+) | Extract methods |
| Large class (500+) | Split classes |
| Duplicate code | Extract shared |
| Magic numbers | Named constants |
| Deep nesting (3+) | Early returns |
| God class | Apply SRP |
| Feature envy | Move to used class |
| Primitives | Value objects |

## Safe Refactoring

1. Have tests first
2. Small changes only
3. Run tests after each
4. Commit often
5. Review diff before push

## Refactoring Examples

**Extract Method:**
```csharp
// Before: validation + calculation + save in one method
// After:
public void ProcessOrder(Order order)
{
    ValidateOrder(order);
    var total = CalculateTotal(order);
    _repository.Save(order);
}
```

**Replace Conditional with Polymorphism:**
```csharp
// Before: switch(customer.Type) { case Regular: return 0.05m; ... }
// After:
public interface IDiscountStrategy { decimal GetDiscount(); }
public class RegularDiscount : IDiscountStrategy { public decimal GetDiscount() => 0.05m; }
```

## Modern C# (12+)

**Primary Constructors:**
```csharp
// Before: field + constructor + assignment
// After:
public class Service(IRepository repo, ILogger log) { }
```

**Records:**
```csharp
// Before: class with props + Equals + GetHashCode
// After:
public record CustomerDto(int Id, string Name, string Email);
```

**Collection Expressions:**
```csharp
List<int> list = [1, 2, 3];
int[] array = [1, 2, 3];
string[] empty = [];
```

**File-Scoped Namespaces:**
```csharp
namespace MyApp.Services;
public class MyService { }
```

**Pattern Matching:**
```csharp
if (obj is Customer c) { Process(c); }

var discount = type switch
{
    CustomerType.Regular => 0.05m,
    CustomerType.Premium => 0.15m,
    _ => 0m
};
```

## Code Analyzers

```xml
<PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="9.0.0" />
<PackageReference Include="StyleCop.Analyzers" Version="1.2.0-beta.556" />

<TreatWarningsAsErrors>true</TreatWarningsAsErrors>
<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>
```

## Code Review Output

**IMPORTANT: Code review findings → GitHub Issues**

After completing code review, create GitHub issues for identified problems:

| Priority | Create Issue? | Label |
|----------|---------------|-------|
| Critical (red flags) | ✅ Yes, immediately | `refactor`, `priority:high` |
| Code smells | ✅ Yes | `refactor` |
| Minor improvements | Optional | `enhancement` |

**Issue template for refactoring:**
```markdown
## Summary
[What needs to be refactored and why]

## Problem
- Current state: [describe the smell/violation]
- Impact: [why it matters]

## Proposed Solution
- [ ] Step 1
- [ ] Step 2

## Files Affected
- `path/to/file.cs` (X lines)

## Acceptance Criteria
- [ ] Tests pass
- [ ] No new warnings
- [ ] Code follows SOLID
```

**Why issues instead of just notes:**
- Trackable progress
- Can be assigned and prioritized
- History preserved
- Sub-issues for large refactoring

## Quick Checklist

**Small changes:** Makes sense? Bugs? Clear names? No magic numbers?

**Large changes:** SOLID? Smells fixed? Tests? Architecture impact? Security? Understandable in 6 months?
