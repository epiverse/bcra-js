#!/usr/bin/env Rscript

# BCRA Test Data Generator
# Generates comprehensive test cases for cross-validation between R and JavaScript implementations
# Output: JSON files in packages/bcra/test/fixtures/r-reference/

if (!require("BCRA")) install.packages("BCRA")
if (!require("jsonlite")) install.packages("jsonlite")

# Helper function to create a test case
create_test_case <- function(id, T1, T2, N_Biop, HypPlas, AgeMen, Age1st, N_Rels, Race, description = "") {
  data.frame(
    ID = id,
    T1 = T1,
    T2 = T2,
    N_Biop = N_Biop,
    HypPlas = HypPlas,
    AgeMen = AgeMen,
    Age1st = Age1st,
    N_Rels = N_Rels,
    Race = Race,
    Description = description,
    stringsAsFactors = FALSE
  )
}

# Helper function to run BCRA calculations and combine results
run_bcra <- function(test_data) {
  # Recode and check
  recode_result <- recode.check(test_data, Raw_Ind = 1)

  # Relative risk
  rr_result <- relative.risk(test_data, Raw_Ind = 1)

  # Absolute risk (returns a vector)
  abs_result <- absolute.risk(test_data, Raw_Ind = 1, Avg_White = 0)

  # Average risk for White race only
  avg_result <- rep(NA, nrow(test_data))
  for (i in 1:nrow(test_data)) {
    if (test_data$Race[i] == 1) {
      avg_data <- test_data[i, , drop = FALSE]
      avg_result[i] <- absolute.risk(avg_data, Raw_Ind = 1, Avg_White = 1)
    }
  }

  # Combine all results
  combined <- data.frame(
    ID = test_data$ID,
    T1 = test_data$T1,
    T2 = test_data$T2,
    N_Biop = test_data$N_Biop,
    HypPlas = test_data$HypPlas,
    AgeMen = test_data$AgeMen,
    Age1st = test_data$Age1st,
    N_Rels = test_data$N_Rels,
    Race = test_data$Race,
    Description = test_data$Description,

    # Recoded values
    NB_Cat = as.character(recode_result$NB_Cat),
    AM_Cat = as.character(recode_result$AM_Cat),
    AF_Cat = as.character(recode_result$AF_Cat),
    NR_Cat = as.character(recode_result$NR_Cat),
    R_Hyp = as.numeric(as.character(recode_result$R_Hyp)),
    Race_label = as.character(recode_result$CharRace),
    Error_Ind = as.numeric(as.character(recode_result$Error_Ind)),

    # Relative risk
    RR_Star1 = as.numeric(rr_result$RR_Star1),
    RR_Star2 = as.numeric(rr_result$RR_Star2),
    PatternNumber = as.numeric(rr_result$PatternNumber),

    # Absolute risk
    AbsRisk = as.numeric(abs_result),
    AvgRisk = as.numeric(avg_result),

    stringsAsFactors = FALSE
  )

  return(combined)
}

# ============================================================================
# 1. RACE-SPECIFIC TEST CASES (110 cases)
# ============================================================================
cat("Generating race-specific test cases...\n")

race_tests <- data.frame()
id_counter <- 1

# For each race, create 10 varied test cases
for (race in 1:11) {
  # Base case - typical risk factor data
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
    AgeMen = 12, Age1st = 25, N_Rels = 1, Race = race,
    description = paste0("Race ", race, " - typical case")
  ))
  id_counter <- id_counter + 1

  # High risk profile
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 45, T2 = 55, N_Biop = 2, HypPlas = 1,
    AgeMen = 10, Age1st = 98, N_Rels = 2, Race = race,
    description = paste0("Race ", race, " - high risk")
  ))
  id_counter <- id_counter + 1

  # Low risk profile
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 30, T2 = 35, N_Biop = 0, HypPlas = 99,
    AgeMen = 14, Age1st = 22, N_Rels = 0, Race = race,
    description = paste0("Race ", race, " - low risk")
  ))
  id_counter <- id_counter + 1

  # With unknowns
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 50, T2 = 60, N_Biop = 99, HypPlas = 99,
    AgeMen = 99, Age1st = 99, N_Rels = 99, Race = race,
    description = paste0("Race ", race, " - all unknowns")
  ))
  id_counter <- id_counter + 1

  # Nulliparous
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 45, N_Biop = 1, HypPlas = 0,
    AgeMen = 11, Age1st = 98, N_Rels = 1, Race = race,
    description = paste0("Race ", race, " - nulliparous")
  ))
  id_counter <- id_counter + 1

  # Young individual
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 25, T2 = 30, N_Biop = 0, HypPlas = 99,
    AgeMen = 13, Age1st = 99, N_Rels = 0, Race = race,
    description = paste0("Race ", race, " - young")
  ))
  id_counter <- id_counter + 1

  # Older individual
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 70, T2 = 80, N_Biop = 1, HypPlas = 99,
    AgeMen = 12, Age1st = 28, N_Rels = 0, Race = race,
    description = paste0("Race ", race, " - older")
  ))
  id_counter <- id_counter + 1

  # Multiple biopsies
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 55, T2 = 65, N_Biop = 3, HypPlas = 99,
    AgeMen = 11, Age1st = 30, N_Rels = 1, Race = race,
    description = paste0("Race ", race, " - multiple biopsies")
  ))
  id_counter <- id_counter + 1

  # Multiple relatives
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 42, T2 = 52, N_Biop = 1, HypPlas = 0,
    AgeMen = 12, Age1st = 26, N_Rels = 3, Race = race,
    description = paste0("Race ", race, " - multiple relatives")
  ))
  id_counter <- id_counter + 1

  # Early menarche
  race_tests <- rbind(race_tests, create_test_case(
    id = id_counter, T1 = 38, T2 = 48, N_Biop = 1, HypPlas = 99,
    AgeMen = 9, Age1st = 24, N_Rels = 1, Race = race,
    description = paste0("Race ", race, " - early menarche")
  ))
  id_counter <- id_counter + 1
}

race_results <- run_bcra(race_tests)

# ============================================================================
# 2. AGE EDGE CASES (40 cases)
# ============================================================================
cat("Generating age edge case test cases...\n")

age_tests <- data.frame()

# Minimum age
age_tests <- rbind(age_tests, create_test_case(
  id = id_counter, T1 = 20.0, T2 = 25.0, N_Biop = 0, HypPlas = 99,
  AgeMen = 12, Age1st = 99, N_Rels = 0, Race = 1,
  description = "Minimum valid age (20.0)"
))
id_counter <- id_counter + 1

# Just before threshold
age_tests <- rbind(age_tests, create_test_case(
  id = id_counter, T1 = 49.9, T2 = 54.9, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Just before threshold (49.9)"
))
id_counter <- id_counter + 1

# Exactly at threshold
age_tests <- rbind(age_tests, create_test_case(
  id = id_counter, T1 = 50.0, T2 = 55.0, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Exactly at threshold (50.0)"
))
id_counter <- id_counter + 1

# Just after threshold
age_tests <- rbind(age_tests, create_test_case(
  id = id_counter, T1 = 50.1, T2 = 55.1, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Just after threshold (50.1)"
))
id_counter <- id_counter + 1

# Near maximum
age_tests <- rbind(age_tests, create_test_case(
  id = id_counter, T1 = 89.9, T2 = 90.0, N_Biop = 0, HypPlas = 99,
  AgeMen = 12, Age1st = 30, N_Rels = 0, Race = 1,
  description = "Near maximum (89.9)"
))
id_counter <- id_counter + 1

# Crossing threshold (fractional)
fractional_ages <- list(
  list(T1 = 45.5, T2 = 50.5, desc = "Crossing threshold 45.5→50.5"),
  list(T1 = 48.3, T2 = 51.7, desc = "Crossing threshold 48.3→51.7"),
  list(T1 = 49.0, T2 = 51.0, desc = "Crossing threshold 49.0→51.0"),
  list(T1 = 35.3, T2 = 40.7, desc = "Young fractional 35.3→40.7"),
  list(T1 = 67.8, T2 = 72.2, desc = "Older fractional 67.8→72.2"),
  list(T1 = 40.1, T2 = 41.1, desc = "Single year fractional 40.1→41.1"),
  list(T1 = 55.0, T2 = 56.0, desc = "Single year after threshold 55.0→56.0"),
  list(T1 = 40.0, T2 = 41.0, desc = "Single year integer 40.0→41.0"),
  list(T1 = 20.5, T2 = 30.5, desc = "Long interval fractional 20.5→30.5"),
  list(T1 = 70.3, T2 = 85.7, desc = "Long interval older 70.3→85.7")
)

for (age_case in fractional_ages) {
  age_tests <- rbind(age_tests, create_test_case(
    id = id_counter, T1 = age_case$T1, T2 = age_case$T2,
    N_Biop = 1, HypPlas = 99, AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
    description = age_case$desc
  ))
  id_counter <- id_counter + 1
}

# Test across races with fractional ages
for (race in c(2, 3, 5, 7, 10)) {
  age_tests <- rbind(age_tests, create_test_case(
    id = id_counter, T1 = 45.5, T2 = 50.5,
    N_Biop = 1, HypPlas = 99, AgeMen = 12, Age1st = 25, N_Rels = 1, Race = race,
    description = paste0("Fractional crossing threshold, Race ", race)
  ))
  id_counter <- id_counter + 1
}

# Additional edge cases
additional_age_tests <- list(
  list(T1 = 20.0, T2 = 21.0, desc = "Minimum age, 1 year"),
  list(T1 = 89.0, T2 = 90.0, desc = "Maximum age, 1 year"),
  list(T1 = 49.5, T2 = 50.5, desc = "Centered on threshold"),
  list(T1 = 30.7, T2 = 35.3, desc = "Fractional both ends 30.7→35.3"),
  list(T1 = 60.2, T2 = 65.8, desc = "Fractional both ends 60.2→65.8")
)

for (age_case in additional_age_tests) {
  age_tests <- rbind(age_tests, create_test_case(
    id = id_counter, T1 = age_case$T1, T2 = age_case$T2,
    N_Biop = 1, HypPlas = 99, AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
    description = age_case$desc
  ))
  id_counter <- id_counter + 1
}

age_results <- run_bcra(age_tests)

# ============================================================================
# 3. PATTERN NUMBER COVERAGE (108 cases)
# ============================================================================
cat("Generating pattern number test cases...\n")

pattern_tests <- data.frame()

# Systematically cover all 108 patterns
# Formula: NB_Cat * 36 + AM_Cat * 12 + AF_Cat * 3 + NR_Cat + 1
# NB_Cat: 0, 1, 2 (3 values)
# AM_Cat: 0, 1, 2 (3 values)
# AF_Cat: 0, 1, 2, 3 (4 values)
# NR_Cat: 0, 1, 2 (3 values)
# Total: 3 * 3 * 4 * 3 = 108 patterns

# Map categorical values back to raw inputs for Race 1 (White)
NB_raw <- list(`0` = 0, `1` = 1, `2` = 3)  # 0, 1, 2+ biopsies
AM_raw <- list(`0` = 14, `1` = 12, `2` = 10)  # >=14, 12-13, <=11
AF_raw <- list(`0` = 20, `1` = 25, `2` = 30, `3` = 98)  # <20, 20-24, 25-29, >=30/nulliparous
NR_raw <- list(`0` = 0, `1` = 1, `2` = 2)  # 0, 1, 2+ relatives

for (nb_cat in 0:2) {
  for (am_cat in 0:2) {
    for (af_cat in 0:3) {
      for (nr_cat in 0:2) {
        expected_pattern <- nb_cat * 36 + am_cat * 12 + af_cat * 3 + nr_cat + 1

        # Select appropriate HypPlas based on NB
        hyp_val <- if (NB_raw[[as.character(nb_cat)]] == 0) 99 else 99

        pattern_tests <- rbind(pattern_tests, create_test_case(
          id = id_counter,
          T1 = 40, T2 = 50,
          N_Biop = NB_raw[[as.character(nb_cat)]],
          HypPlas = hyp_val,
          AgeMen = AM_raw[[as.character(am_cat)]],
          Age1st = AF_raw[[as.character(af_cat)]],
          N_Rels = NR_raw[[as.character(nr_cat)]],
          Race = 1,
          description = paste0("Pattern ", expected_pattern, " (NB=", nb_cat, ",AM=", am_cat, ",AF=", af_cat, ",NR=", nr_cat, ")")
        ))
        id_counter <- id_counter + 1
      }
    }
  }
}

pattern_results <- run_bcra(pattern_tests)

# ============================================================================
# 4. SPECIAL VALUES (30 cases)
# ============================================================================
cat("Generating special values test cases...\n")

special_tests <- data.frame()

# Nulliparous (Age1st = 98) across races
for (race in c(1, 2, 3, 5, 7, 10)) {
  special_tests <- rbind(special_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
    AgeMen = 12, Age1st = 98, N_Rels = 1, Race = race,
    description = paste0("Nulliparous, Race ", race)
  ))
  id_counter <- id_counter + 1
}

# Unknown values (99) for each field
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 99, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Unknown biopsies"
))
id_counter <- id_counter + 1

special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 99, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Unknown menarche"
))
id_counter <- id_counter + 1

special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 99, N_Rels = 1, Race = 1,
  description = "Unknown first birth"
))
id_counter <- id_counter + 1

special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 99, Race = 1,
  description = "Unknown relatives"
))
id_counter <- id_counter + 1

# All unknowns
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 99, HypPlas = 99,
  AgeMen = 99, Age1st = 99, N_Rels = 99, Race = 1,
  description = "All unknowns"
))
id_counter <- id_counter + 1

# Biopsy/hyperplasia combinations
# No biopsy, must have HypPlas = 99
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 0, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "No biopsy, HypPlas=99 (valid)"
))
id_counter <- id_counter + 1

# With biopsy, HypPlas = 0
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 0,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "With biopsy, no hyperplasia"
))
id_counter <- id_counter + 1

# With biopsy, HypPlas = 1
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 1,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "With biopsy, with hyperplasia"
))
id_counter <- id_counter + 1

# With biopsy, HypPlas = 99 (unknown)
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "With biopsy, unknown hyperplasia"
))
id_counter <- id_counter + 1

# Multiple biopsies with hyperplasia
special_tests <- rbind(special_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 3, HypPlas = 1,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Multiple biopsies with hyperplasia"
))
id_counter <- id_counter + 1

# Edge menarche ages
for (menarche in c(7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17)) {
  special_tests <- rbind(special_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
    AgeMen = menarche, Age1st = menarche + 10, N_Rels = 1, Race = 1,
    description = paste0("Menarche at age ", menarche)
  ))
  id_counter <- id_counter + 1
}

special_results <- run_bcra(special_tests)

# ============================================================================
# 5. VALIDATION ERRORS (25 cases)
# ============================================================================
cat("Generating validation error test cases...\n")

error_tests <- data.frame()

# Age constraints - these should produce Error_Ind = 1
error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 19.9, T2 = 25, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 99, N_Rels = 1, Race = 1,
  description = "Age < 20 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 90.0, T2 = 95, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 30, N_Rels = 1, Race = 1,
  description = "T1 >= 90 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 85, T2 = 91, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 30, N_Rels = 1, Race = 1,
  description = "T2 > 90 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 50, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "T2 <= T1 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 50, T2 = 45, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "T2 < T1 (invalid)"
))
id_counter <- id_counter + 1

# Chronological errors
error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 45, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Menarche > current age (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 14, Age1st = 12, N_Rels = 1, Race = 1,
  description = "First birth < menarche (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 14, Age1st = 45, N_Rels = 1, Race = 1,
  description = "First birth > current age (invalid)"
))
id_counter <- id_counter + 1

# Biopsy/hyperplasia inconsistency
error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 0, HypPlas = 0,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "No biopsy but HypPlas=0 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 0, HypPlas = 1,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "No biopsy but HypPlas=1 (invalid)"
))
id_counter <- id_counter + 1

# Invalid race codes
error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 0,
  description = "Invalid race 0"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 12,
  description = "Invalid race 12"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = -1,
  description = "Invalid race -1"
))
id_counter <- id_counter + 1

# Invalid field values
error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = -1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Negative biopsies"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 5, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Menarche too early (5)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 10, N_Rels = 1, Race = 1,
  description = "First birth too early (10, menarche 12)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = -1, Race = 1,
  description = "Negative relatives"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 2,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Invalid hyperplasia value (2)"
))
id_counter <- id_counter + 1

# Additional edge case errors
error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 99, HypPlas = 0,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Unknown biopsy but HypPlas=0 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 40, T2 = 50, N_Biop = 99, HypPlas = 1,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Unknown biopsy but HypPlas=1 (invalid)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 20, T2 = 20.5, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Very short interval (0.5 years)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 35, T2 = 90, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Very long interval (55 years)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 89.5, T2 = 90, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Short interval near max (89.5→90)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 20, T2 = 89.9, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Lifetime risk (20→89.9)"
))
id_counter <- id_counter + 1

error_tests <- rbind(error_tests, create_test_case(
  id = id_counter, T1 = 20, T2 = 90, N_Biop = 1, HypPlas = 99,
  AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
  description = "Full lifetime risk (20→90)"
))
id_counter <- id_counter + 1

error_results <- run_bcra(error_tests)

# ============================================================================
# 6. NUMERICAL ACCURACY CASES (50 cases)
# ============================================================================
cat("Generating numerical accuracy test cases...\n")

numerical_tests <- data.frame()

# Vary each parameter systematically to test precision
# Different biopsy counts
for (n_biop in c(0, 1, 2, 3, 4, 5)) {
  hyp_val <- if (n_biop == 0) 99 else 99
  numerical_tests <- rbind(numerical_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = n_biop, HypPlas = hyp_val,
    AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
    description = paste0("Biopsies = ", n_biop)
  ))
  id_counter <- id_counter + 1
}

# Different menarche ages
for (menarche in c(7, 9, 11, 12, 13, 14, 15, 16, 99)) {
  numerical_tests <- rbind(numerical_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
    AgeMen = menarche, Age1st = if (menarche == 99) 25 else max(menarche + 5, 20),
    N_Rels = 1, Race = 1,
    description = paste0("Menarche = ", menarche)
  ))
  id_counter <- id_counter + 1
}

# Different first birth ages
for (age1st in c(15, 18, 20, 22, 24, 25, 26, 28, 30, 32, 35, 98, 99)) {
  numerical_tests <- rbind(numerical_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
    AgeMen = 12, Age1st = age1st, N_Rels = 1, Race = 1,
    description = paste0("First birth = ", age1st)
  ))
  id_counter <- id_counter + 1
}

# Different numbers of relatives
for (n_rels in c(0, 1, 2, 3, 4, 5, 99)) {
  numerical_tests <- rbind(numerical_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = 99,
    AgeMen = 12, Age1st = 25, N_Rels = n_rels, Race = 1,
    description = paste0("Relatives = ", n_rels)
  ))
  id_counter <- id_counter + 1
}

# Hyperplasia variations
for (hyp in c(0, 1, 99)) {
  numerical_tests <- rbind(numerical_tests, create_test_case(
    id = id_counter, T1 = 40, T2 = 50, N_Biop = 1, HypPlas = hyp,
    AgeMen = 12, Age1st = 25, N_Rels = 1, Race = 1,
    description = paste0("Hyperplasia = ", hyp)
  ))
  id_counter <- id_counter + 1
}

# Different projection intervals
for (interval in c(1, 2, 5, 10, 15, 20, 30, 50, 69)) {
  t1_val <- 20
  t2_val <- min(20 + interval, 90)
  numerical_tests <- rbind(numerical_tests, create_test_case(
    id = id_counter, T1 = t1_val, T2 = t2_val, N_Biop = 1, HypPlas = 99,
    AgeMen = 12, Age1st = 99, N_Rels = 1, Race = 1,
    description = paste0("Interval = ", interval, " years")
  ))
  id_counter <- id_counter + 1
}

numerical_results <- run_bcra(numerical_tests)

# ============================================================================
# SAVE RESULTS TO JSON
# ============================================================================
cat("Saving results to JSON files...\n")

# Create output directory
output_dir <- "packages/bcra/test/fixtures/r-reference"
dir.create(output_dir, recursive = TRUE, showWarnings = FALSE)

# Save each category
write_json(race_results, paste0(output_dir, "/race-specific.json"), pretty = TRUE, digits = 10)
write_json(age_results, paste0(output_dir, "/age-edge-cases.json"), pretty = TRUE, digits = 10)
write_json(pattern_results, paste0(output_dir, "/pattern-numbers.json"), pretty = TRUE, digits = 10)
write_json(special_results, paste0(output_dir, "/special-values.json"), pretty = TRUE, digits = 10)
write_json(error_results, paste0(output_dir, "/validation-errors.json"), pretty = TRUE, digits = 10)
write_json(numerical_results, paste0(output_dir, "/numerical-accuracy.json"), pretty = TRUE, digits = 10)

# Create summary
summary <- data.frame(
  Category = c("Race-Specific", "Age Edge Cases", "Pattern Numbers", "Special Values", "Validation Errors", "Numerical Accuracy"),
  TestCases = c(nrow(race_tests), nrow(age_tests), nrow(pattern_tests), nrow(special_tests), nrow(error_tests), nrow(numerical_tests)),
  ValidCases = c(
    sum(race_results$Error_Ind == 0),
    sum(age_results$Error_Ind == 0),
    sum(pattern_results$Error_Ind == 0),
    sum(special_results$Error_Ind == 0),
    sum(error_results$Error_Ind == 0),
    sum(numerical_results$Error_Ind == 0)
  ),
  ErrorCases = c(
    sum(race_results$Error_Ind == 1),
    sum(age_results$Error_Ind == 1),
    sum(pattern_results$Error_Ind == 1),
    sum(special_results$Error_Ind == 1),
    sum(error_results$Error_Ind == 1),
    sum(numerical_results$Error_Ind == 1)
  )
)

write_json(summary, paste0(output_dir, "/summary.json"), pretty = TRUE)

cat("\n=================================================================\n")
cat("TEST DATA GENERATION COMPLETE\n")
cat("=================================================================\n\n")
print(summary)
cat("\nTotal test cases generated:", sum(summary$TestCases), "\n")
cat("Valid cases:", sum(summary$ValidCases), "\n")
cat("Error cases:", sum(summary$ErrorCases), "\n")
cat("\nFiles saved to:", output_dir, "\n")
