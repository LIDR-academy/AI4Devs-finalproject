using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InkLink.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "tattoo_styles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    slug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    icon_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_tattoo_styles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    role = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    first_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    last_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    avatar_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_verified = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "artist_profiles",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    bio = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    years_experience = table.Column<int>(type: "integer", nullable: false),
                    artist_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    latitude = table.Column<decimal>(type: "numeric(10,8)", precision: 10, scale: 8, nullable: false),
                    longitude = table.Column<decimal>(type: "numeric(11,8)", precision: 11, scale: 8, nullable: false),
                    address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    commune = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    min_session_price = table.Column<int>(type: "integer", nullable: false),
                    hourly_rate = table.Column<int>(type: "integer", nullable: false),
                    deposit_percentage = table.Column<int>(type: "integer", nullable: false, defaultValue: 30),
                    cancellation_policy = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_published = table.Column<bool>(type: "boolean", nullable: false),
                    rating_avg = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: false),
                    total_reviews = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_artist_profiles", x => x.id);
                    table.ForeignKey(
                        name: "fk_artist_profiles_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "artist_styles",
                columns: table => new
                {
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    style_id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_artist_styles", x => new { x.artist_profile_id, x.style_id });
                    table.ForeignKey(
                        name: "fk_artist_styles_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_artist_styles_tattoo_styles_style_id",
                        column: x => x.style_id,
                        principalTable: "tattoo_styles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "availabilities",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    day_of_week = table.Column<int>(type: "integer", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    slot_duration_minutes = table.Column<int>(type: "integer", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_availabilities", x => x.id);
                    table.ForeignKey(
                        name: "fk_availabilities_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "awards",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    event_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    year = table.Column<int>(type: "integer", nullable: false),
                    category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    badge_icon_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_awards", x => x.id);
                    table.ForeignKey(
                        name: "fk_awards_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "blocked_dates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    date = table.Column<DateOnly>(type: "date", nullable: false),
                    reason = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_blocked_dates", x => x.id);
                    table.ForeignKey(
                        name: "fk_blocked_dates_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bookings",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_date = table.Column<DateOnly>(type: "date", nullable: false),
                    start_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    end_time = table.Column<TimeOnly>(type: "time without time zone", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    estimated_price_min = table.Column<int>(type: "integer", nullable: false),
                    estimated_price_max = table.Column<int>(type: "integer", nullable: false),
                    deposit_amount = table.Column<int>(type: "integer", nullable: false),
                    body_zone = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    size_reference = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    style_id = table.Column<Guid>(type: "uuid", nullable: true),
                    is_color = table.Column<bool>(type: "boolean", nullable: false),
                    is_coverup = table.Column<bool>(type: "boolean", nullable: false),
                    reference_images = table.Column<string>(type: "jsonb", nullable: false),
                    notes = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    cancelled_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_bookings", x => x.id);
                    table.ForeignKey(
                        name: "fk_bookings_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bookings_tattoo_styles_style_id",
                        column: x => x.style_id,
                        principalTable: "tattoo_styles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_bookings_users_client_id",
                        column: x => x.client_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "certifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    issuer = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    valid_until = table.Column<DateOnly>(type: "date", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_certifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_certifications_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "portfolio_items",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    image_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    thumbnail_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    style_id = table.Column<Guid>(type: "uuid", nullable: false),
                    description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    is_featured = table.Column<bool>(type: "boolean", nullable: false),
                    sort_order = table.Column<int>(type: "integer", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_portfolio_items", x => x.id);
                    table.ForeignKey(
                        name: "fk_portfolio_items_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_portfolio_items_tattoo_styles_style_id",
                        column: x => x.style_id,
                        principalTable: "tattoo_styles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "sponsorships",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    brand_name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    brand_logo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    relationship_type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_sponsorships", x => x.id);
                    table.ForeignKey(
                        name: "fk_sponsorships_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    flow_transaction_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    amount = table.Column<int>(type: "integer", nullable: false),
                    platform_fee = table.Column<int>(type: "integer", nullable: false),
                    artist_amount = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    paid_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_payments", x => x.id);
                    table.ForeignKey(
                        name: "fk_payments_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reviews",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    booking_id = table.Column<Guid>(type: "uuid", nullable: false),
                    client_id = table.Column<Guid>(type: "uuid", nullable: false),
                    artist_profile_id = table.Column<Guid>(type: "uuid", nullable: false),
                    rating_hygiene = table.Column<int>(type: "integer", nullable: false),
                    rating_pain_management = table.Column<int>(type: "integer", nullable: false),
                    rating_customer_service = table.Column<int>(type: "integer", nullable: false),
                    rating_result = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    tattoo_photo_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_reviews", x => x.id);
                    table.ForeignKey(
                        name: "fk_reviews_artist_profiles_artist_profile_id",
                        column: x => x.artist_profile_id,
                        principalTable: "artist_profiles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_reviews_bookings_booking_id",
                        column: x => x.booking_id,
                        principalTable: "bookings",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "fk_reviews_users_client_id",
                        column: x => x.client_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "ix_artist_profiles_commune",
                table: "artist_profiles",
                column: "commune");

            migrationBuilder.CreateIndex(
                name: "ix_artist_profiles_is_published",
                table: "artist_profiles",
                column: "is_published");

            migrationBuilder.CreateIndex(
                name: "ix_artist_profiles_rating_avg",
                table: "artist_profiles",
                column: "rating_avg");

            migrationBuilder.CreateIndex(
                name: "ix_artist_profiles_slug",
                table: "artist_profiles",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_artist_profiles_user_id",
                table: "artist_profiles",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_artist_styles_style_id",
                table: "artist_styles",
                column: "style_id");

            migrationBuilder.CreateIndex(
                name: "ix_availabilities_artist_profile_id",
                table: "availabilities",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_awards_artist_profile_id",
                table: "awards",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_blocked_dates_artist_profile_id_date",
                table: "blocked_dates",
                columns: new[] { "artist_profile_id", "date" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_bookings_artist_profile_id",
                table: "bookings",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_booking_date",
                table: "bookings",
                column: "booking_date");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_client_id",
                table: "bookings",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_status",
                table: "bookings",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "ix_bookings_style_id",
                table: "bookings",
                column: "style_id");

            migrationBuilder.CreateIndex(
                name: "ix_certifications_artist_profile_id",
                table: "certifications",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_certifications_is_active",
                table: "certifications",
                column: "is_active");

            migrationBuilder.CreateIndex(
                name: "ix_payments_booking_id",
                table: "payments",
                column: "booking_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_portfolio_items_artist_profile_id",
                table: "portfolio_items",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_portfolio_items_style_id",
                table: "portfolio_items",
                column: "style_id");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_artist_profile_id",
                table: "reviews",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_reviews_booking_id",
                table: "reviews",
                column: "booking_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_reviews_client_id",
                table: "reviews",
                column: "client_id");

            migrationBuilder.CreateIndex(
                name: "ix_sponsorships_artist_profile_id",
                table: "sponsorships",
                column: "artist_profile_id");

            migrationBuilder.CreateIndex(
                name: "ix_tattoo_styles_name",
                table: "tattoo_styles",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_tattoo_styles_slug",
                table: "tattoo_styles",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "artist_styles");

            migrationBuilder.DropTable(
                name: "availabilities");

            migrationBuilder.DropTable(
                name: "awards");

            migrationBuilder.DropTable(
                name: "blocked_dates");

            migrationBuilder.DropTable(
                name: "certifications");

            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "portfolio_items");

            migrationBuilder.DropTable(
                name: "reviews");

            migrationBuilder.DropTable(
                name: "sponsorships");

            migrationBuilder.DropTable(
                name: "bookings");

            migrationBuilder.DropTable(
                name: "artist_profiles");

            migrationBuilder.DropTable(
                name: "tattoo_styles");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
