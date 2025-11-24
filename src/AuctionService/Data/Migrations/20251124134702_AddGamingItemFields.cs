using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AuctionService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGamingItemFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mileage",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "Items");

            migrationBuilder.RenameColumn(
                name: "Model",
                table: "Items",
                newName: "Variant");

            migrationBuilder.RenameColumn(
                name: "Make",
                table: "Items",
                newName: "Title");

            migrationBuilder.RenameColumn(
                name: "Colour",
                table: "Items",
                newName: "Specs");

            migrationBuilder.AddColumn<string>(
                name: "Brand",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Colorway",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Condition",
                table: "Items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ReleaseYear",
                table: "Items",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Brand",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Category",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Colorway",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "Condition",
                table: "Items");

            migrationBuilder.DropColumn(
                name: "ReleaseYear",
                table: "Items");

            migrationBuilder.RenameColumn(
                name: "Variant",
                table: "Items",
                newName: "Model");

            migrationBuilder.RenameColumn(
                name: "Title",
                table: "Items",
                newName: "Make");

            migrationBuilder.RenameColumn(
                name: "Specs",
                table: "Items",
                newName: "Colour");

            migrationBuilder.AddColumn<int>(
                name: "Mileage",
                table: "Items",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "Items",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }
    }
}
