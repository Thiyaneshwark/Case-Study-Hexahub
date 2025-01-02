"# Case-Study-Hexahub" 



public interface ILoanRepository
{
    Task<bool> ApplyLoan(Loan loan);
    Task<double> CalculateInterest(int loanId);
    Task<string> LoanStatus(int loanId);
    Task<double> CalculateEMI(int loanId);
    Task<bool> LoanRepayment(int loanId, double amount);
    Task<List<Loan>> GetAllLoans();
    Task<Loan> GetLoanById(int loanId);
}




public class LoanRepository : ILoanRepository
{
    private readonly ApplicationDbContext _context;

    public LoanRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> ApplyLoan(Loan loan)
    {
        _context.Loans.Add(loan);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<double> CalculateInterest(int loanId)
    {
        var loan = await GetLoanById(loanId);
        if (loan == null) throw new InvalidLoanException("Loan not found.");

        return (loan.PrincipalAmount * loan.InterestRate * loan.LoanTerm) / 12;
    }

    public async Task<string> LoanStatus(int loanId)
    {
        var loan = await GetLoanById(loanId);
        if (loan == null) throw new InvalidLoanException("Loan not found.");

        loan.LoanStatus = loan.Customer.CreditScore > 650 ? "Approved" : "Rejected";
        await _context.SaveChangesAsync();
        return loan.LoanStatus;
    }

    public async Task<double> CalculateEMI(int loanId)
    {
        var loan = await GetLoanById(loanId);
        if (loan == null) throw new InvalidLoanException("Loan not found.");

        double R = loan.InterestRate / 12 / 100;
        double EMI = (loan.PrincipalAmount * R * Math.Pow(1 + R, loan.LoanTerm)) / (Math.Pow(1 + R, loan.LoanTerm) - 1);
        return EMI;
    }

    public async Task<bool> LoanRepayment(int loanId, double amount)
    {
        var loan = await GetLoanById(loanId);
        if (loan == null) throw new InvalidLoanException("Loan not found.");

        double EMI = await CalculateEMI(loanId);
        if (amount < EMI)
            return false;

        // Repay loan
        // Further implementation here

        return true;
    }

    public async Task<List<Loan>> GetAllLoans()
    {
        return await _context.Loans.ToListAsync();
    }

    public async Task<Loan> GetLoanById(int loanId)
    {
        return await _context.Loans.Include(l => l.Customer).FirstOrDefaultAsync(l => l.LoanId == loanId);
    }
}


public class InvalidLoanException : Exception
{
    public InvalidLoanException(string message) : base(message) {}
}



[ApiController]
[Route("api/[controller]")]
public class LoanController : ControllerBase
{
    private readonly ILoanRepository _loanRepository;

    public LoanController(ILoanRepository loanRepository)
    {
        _loanRepository = loanRepository;
    }

    [HttpPost("applyLoan")]
    public async Task<IActionResult> ApplyLoan([FromBody] Loan loan)
    {
        var result = await _loanRepository.ApplyLoan(loan);
        return Ok(result);
    }

    [HttpGet("loanStatus/{loanId}")]
    public async Task<IActionResult> LoanStatus(int loanId)
    {
        var result = await _loanRepository.LoanStatus(loanId);
        return Ok(result);
    }

    [HttpGet("calculateEMI/{loanId}")]
    public async Task<IActionResult> CalculateEMI(int loanId)
    {
        var result = await _loanRepository.CalculateEMI(loanId);
        return Ok(result);
    }

    [HttpGet("getLoanById/{loanId}")]
    public async Task<IActionResult> GetLoanById(int loanId)
    {
        var loan = await _loanRepository.GetLoanById(loanId);
        if (loan == null) return NotFound("Loan not found.");
        return Ok(loan);
    }

    [HttpGet("getAllLoans")]
    public async Task<IActionResult> GetAllLoans()
    {
        var loans = await _loanRepository.GetAllLoans();
        return Ok(loans);
    }
}



using LoanManagementSystem.Entity;
using Microsoft.EntityFrameworkCore;

namespace LoanManagementSystem.Context
{
    public class LoanManagementContext : DbContext
    {
        // Constructor that accepts DbContextOptions
        public LoanManagementContext(DbContextOptions<LoanManagementContext> options)
            : base(options)
        {
        }

        // DbSet properties for each entity class
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Loan> Loans { get; set; }
        public DbSet<HomeLoan> HomeLoans { get; set; }
        public DbSet<CarLoan> CarLoans { get; set; }

        // Fluent API for table configurations
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships and constraints
            modelBuilder.Entity<Loan>()
                .HasOne(l => l.Customer)
                .WithMany(c => c.Loans)
                .HasForeignKey(l => l.CustomerId)
                .OnDelete(DeleteBehavior.Cascade);

            // Discriminator for Loan hierarchy
            modelBuilder.Entity<Loan>()
                .HasDiscriminator<string>("LoanType")
                .HasValue<HomeLoan>("HomeLoan")
                .HasValue<CarLoan>("CarLoan");

            // Enum conversion for LoanStatus
            modelBuilder.Entity<Loan>()
                .Property(l => l.LoanStatus)
                .HasConversion<string>();

            // Enum conversion for LoanType
            modelBuilder.Entity<Loan>()
                .Property(l => l.LoanType)
                .HasConversion<string>();
        }
    }
}

