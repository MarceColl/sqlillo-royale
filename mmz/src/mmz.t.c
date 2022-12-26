#include "mmz.h"

#if defined(CIUT_ENABLED) && (CIUT_ENABLED == 1)
#include <ciut.h>

TEST_CASE() {
  REQUIRE(0 == 1);
}

#endif
