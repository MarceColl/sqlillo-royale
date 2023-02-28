cc_binary(
    name = "runner",
    srcs = glob(["src/*.c"]) + glob(["src/*.h"]),
	deps = [
		"@system_libs//:luajit",
		"@system_libs//:libpq",
	],
	copts = [
		"-I/usr/include/luajit-2.1/",
		"-I/usr/include/luajit-2.1/",
	],
)
