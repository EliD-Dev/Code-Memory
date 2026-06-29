package com.memoiredecode.api.service;

public record QuickStartInfo(
    String wingetCommands,
    String brewCommands,
    String nativeCommands,
    boolean hasCommittedEnv
) {}
