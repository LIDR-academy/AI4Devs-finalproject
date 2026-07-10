using Aura.Core.DTOs.Guests;
using Aura.Core.Validators.Guests;
using FluentValidation.TestHelper;
using Xunit;

namespace Aura.Core.Tests.Validators;

public class ImportGuestRowValidatorTests
{
    private readonly ImportGuestRowValidator _validator;

    public ImportGuestRowValidatorTests()
    {
        _validator = new ImportGuestRowValidator();
    }

    [Fact]
    public void Validates_Name_Required()
    {
        var model = new ImportGuestRow { Name = "" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Validates_Email_Format()
    {
        var model = new ImportGuestRow { Name = "Test", Email = "invalid-email" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Email);
    }

    [Fact]
    public void Validates_Category_Enum()
    {
        var model = new ImportGuestRow { Name = "Test", Category = "InvalidCategory" };
        var result = _validator.TestValidate(model);
        result.ShouldHaveValidationErrorFor(x => x.Category);
    }

    [Fact]
    public void Allows_Valid_Model()
    {
        var model = new ImportGuestRow 
        { 
            Name = "John Doe", 
            Email = "john@example.com",
            Phone = "+1234567890",
            Category = "Family"
        };
        var result = _validator.TestValidate(model);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
