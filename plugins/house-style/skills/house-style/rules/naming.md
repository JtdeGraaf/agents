# Rule: Names — plain English, self-explanatory (NON-NEGOTIABLE)

Code is written for the next human who reads it, not for a machine and not to sound clever. Every class, method,
variable and file name says what it is or does in **plain, everyday English** that a new teammate understands
without asking.

## How to name

- **Use the words the users or the business use.** An `Invoice` that gets `sent`, not a `BillingArtifact` that gets
  `dispatched`.
- **Methods are a verb plus what they act on:** `sendInvoice`, `cancelOrder`, `findOpenShifts`. The name says what
  happens, so the reader doesn't open the body to find out.
- **Booleans read as a yes/no question:** `isPaid`, `hasItems`, `canStart`.
- **Classes are things, named after what they are:** `ShoppingCart`, `PriceCalculator`, `LoginForm`.
- **Write words out.** No abbreviations except ones everyone knows (`id`, `url`, `html`, `api`). `customerAddress`,
  not `custAddr`. Single letters only for tiny scopes (`i` in a loop, `x` in a one-line lambda).
- **As long as needed to be clear, no longer.** Don't repeat the type or the context: `order.total`, not
  `order.orderTotalAmountValue`.
- **One word per idea, everywhere.** If it's called a `shift` in one file, it isn't a `slot` or a `duty` in the next.

## No jargon, no AI-speak

Banned unless it is genuinely the established name of the thing in this codebase or framework (a Spring `@Service`,
a packet `Handler` layer):

| Don't | Do |
|---|---|
| `OrderProcessingOrchestrator` | `OrderService`, or what it really does: `PlaceOrder` |
| `UserDataManager`, `UserInfoHelper` | `UserRepository`, `formatUserName` |
| `processData(input)` | `parseCsvRows(file)` |
| `handleStuff`, `doWork`, `executeLogic` | say what it does: `retryFailedPayments` |
| `leverageCache`, `utilizeConfig` | `readFromCache`, `loadConfig` |
| `robustValidate`, `enhancedSearch`, `seamlessSync` | `validate`, `search`, `sync` |
| `ComprehensiveReportGenerationEngine` | `ReportBuilder` |
| `ctx`, `mgr`, `svc`, `tmp`, `res2` | `context`, `manager`, `service`, the real meaning |

Words that almost always mean the name is hiding something: *manager, processor, orchestrator, facilitator,
handler (outside a handler layer), helper, util, engine, data, info, logic, stuff, item (when it's really a product),
leverage, utilize, robust, seamless, enhanced, comprehensive, holistic, streamlined*.

**Self-check:** read the code out loud to someone who knows the product but not this file. If a name needs
explaining, or you need a comment to say what it means, rename it.
