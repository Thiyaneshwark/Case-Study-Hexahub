using System.Collections.Generic;
using LoanManagementSystem.Models;

namespace LoanManagementSystem.Repositories
{
    public interface ILoanRepository
    {
        void ApplyLoan(Loan loan);
        double CalculateInterest(int loanId);
        double CalculateEMI(int loanId);
        void LoanRepayment(int loanId, double amount);
        List<Loan> GetAllLoans();
        Loan GetLoanById(int loanId);
        void UpdateLoanStatus(int loanId);
    }
}


using LoanManagementSystem.Models;
using LoanManagementSystem.Exceptions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;

namespace LoanManagementSystem.Repositories
{
    public class LoanRepository : ILoanRepository
    {
        private readonly ApplicationDbContext _dbContext;

        public LoanRepository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // Apply for a new loan
        public void ApplyLoan(Loan loan)
        {
            loan.LoanStatus = "Pending";
            _dbContext.Loans.Add(loan);
            _dbContext.SaveChanges();
        }

        // Calculate interest for a loan
        public double CalculateInterest(int loanId)
        {
            var loan = _dbContext.Loans.Find(loanId);

            if (loan == null)
                throw new InvalidLoanException($"Loan with ID {loanId} not found.");

            double interest = (loan.PrincipalAmount * loan.InterestRate * loan.LoanTerm) / 12;
            return interest;
        }

        // Calculate EMI for a loan
        public double CalculateEMI(int loanId)
        {
            var loan = _dbContext.Loans.Find(loanId);

            if (loan == null)
                throw new InvalidLoanException($"Loan with ID {loanId} not found.");

            double monthlyRate = loan.InterestRate / 12 / 100;
            int tenure = loan.LoanTerm;

            double emi = (loan.PrincipalAmount * monthlyRate * Math.Pow(1 + monthlyRate, tenure)) /
                         (Math.Pow(1 + monthlyRate, tenure) - 1);

            return emi;
        }

        // Process loan repayment
        public void LoanRepayment(int loanId, double amount)
        {
            var loan = _dbContext.Loans.Find(loanId);

            if (loan == null)
                throw new InvalidLoanException($"Loan with ID {loanId} not found.");

            double emi = CalculateEMI(loanId);

            if (amount < emi)
                throw new InvalidPaymentException("Amount is less than the monthly EMI.");

            int paidMonths = (int)(amount / emi);
            loan.LoanTerm -= paidMonths;

            if (loan.LoanTerm <= 0)
                loan.LoanStatus = "Paid";

            _dbContext.Loans.Update(loan);
            _dbContext.SaveChanges();
        }

        // Get all loans
        public List<Loan> GetAllLoans()
        {
            return _dbContext.Loans.Include(l => l.Customer).ToList();
        }

        // Get loan by ID
        public Loan GetLoanById(int loanId)
        {
            var loan = _dbContext.Loans
                .Include(l => l.Customer)
                .FirstOrDefault(l => l.LoanId == loanId);

            if (loan == null)
                throw new InvalidLoanException($"Loan with ID {loanId} not found.");

            return loan;
        }

        // Update loan status based on credit score
        public void UpdateLoanStatus(int loanId)
        {
            var loan = _dbContext.Loans.Include(l => l.Customer).FirstOrDefault(l => l.LoanId == loanId);

            if (loan == null)
                throw new InvalidLoanException($"Loan with ID {loanId} not found.");

            loan.LoanStatus = loan.Customer.CreditScore > 650 ? "Approved" : "Rejected";
            _dbContext.Loans.Update(loan);
            _dbContext.SaveChanges();
        }
    }
}



using System;

namespace LoanManagementSystem.Exceptions
{
    public class InvalidLoanException : Exception
    {
        public InvalidLoanException(string message) : base(message)
        {
        }
    }
}


using System;

namespace LoanManagementSystem.Exceptions
{
    public class InvalidPaymentException : Exception
    {
        public InvalidPaymentException(string message) : base(message)
        {
        }
    }
}


using LoanManagementSystem.Models;
using LoanManagementSystem.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace LoanManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoanController : ControllerBase
    {
        private readonly ILoanRepository _loanRepository;

        public LoanController(ILoanRepository loanRepository)
        {
            _loanRepository = loanRepository;
        }

        [HttpPost("apply")]
        public IActionResult ApplyLoan([FromBody] Loan loan)
        {
            _loanRepository.ApplyLoan(loan);
            return Ok("Loan application submitted successfully.");
        }

        [HttpGet("{id}/interest")]
        public IActionResult CalculateInterest(int id)
        {
            double interest = _loanRepository.CalculateInterest(id);
            return Ok(new { Interest = interest });
        }

        [HttpGet("{id}/emi")]
        public IActionResult CalculateEMI(int id)
        {
            double emi = _loanRepository.CalculateEMI(id);
            return Ok(new { EMI = emi });
        }

        [HttpGet]
        public IActionResult GetAllLoans()
        {
            var loans = _loanRepository.GetAllLoans();
            return Ok(loans);
        }

        [HttpGet("{id}")]
        public IActionResult GetLoanById(int id)
        {
            var loan = _loanRepository.GetLoanById(id);
            return Ok(loan);
        }

        [HttpPut("{id}/repayment")]
        public IActionResult LoanRepayment(int id, [FromQuery] double amount)
        {
            _loanRepository.LoanRepayment(id, amount);
            return Ok("Repayment processed successfully.");
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateLoanStatus(int id)
        {
            _loanRepository.UpdateLoanStatus(id);
            return Ok("Loan status updated successfully.");
        }
    }
}
