# Security Advisory - Dependency Updates

## Summary

This document tracks the security vulnerabilities found in the initial dependency versions and the actions taken to address them.

## Vulnerabilities Fixed

### Critical Vulnerabilities Patched

#### 1. cryptography 41.0.7 → 46.0.5
**Severity**: High

**Vulnerabilities Fixed**:
- **Subgroup Attack on SECT Curves** (CVE: Affects <= 46.0.4)
  - Impact: Cryptographic weakness in elliptic curve operations
  - Fix: Upgraded to 46.0.5

- **NULL Pointer Dereference** (CVE: Affects 38.0.0 - 42.0.3)
  - Impact: Potential crash with pkcs12.serialize_key_and_certificates
  - Fix: Upgraded to 46.0.5

- **Bleichenbacher Timing Oracle Attack** (CVE: Affects < 42.0.0)
  - Impact: Side-channel attack on RSA encryption
  - Fix: Upgraded to 46.0.5

#### 2. lightgbm 4.1.0 → 4.6.0
**Severity**: Critical

**Vulnerability Fixed**:
- **Remote Code Execution (RCE)** (CVE: Affects 1.0.0 - 4.5.0)
  - Impact: Arbitrary code execution via malicious model files
  - Fix: Upgraded to 4.6.0

#### 3. torch 2.5.1 → 2.6.0
**Severity**: Critical

**Vulnerability Fixed**:
- **RCE via torch.load** (CVE: Affects < 2.6.0)
  - Impact: Remote code execution even with weights_only=True
  - Fix: Upgraded to 2.6.0

#### 4. python-multipart 0.0.12 → 0.0.22
**Severity**: High

**Vulnerabilities Fixed**:
- **Arbitrary File Write** (CVE: Affects < 0.0.22)
  - Impact: File system manipulation via non-default configuration
  - Fix: Upgraded to 0.0.22

- **Denial of Service (DoS)** (CVE: Affects < 0.0.18)
  - Impact: DoS via deformed multipart/form-data boundary
  - Fix: Upgraded to 0.0.22

### Package Removed

#### 5. mlflow 2.9.2 → REMOVED
**Severity**: Critical (Multiple)

**Decision**: Removed entirely due to extensive vulnerabilities, many without available patches.

**Vulnerabilities Present** (30+ total):
- **Path Traversal** - Multiple instances (some unpatched)
- **Remote Code Execution (RCE)** - Directory traversal in model creation
- **Unsafe Deserialization** - Multiple instances (many unpatched)
- **Cross-Site Scripting (XSS)** - Leading to client-side RCE
- **Local File Inclusion (LFI)**
- **DNS Rebinding Attacks**
- **Weak Password Requirements**
- **Excessive Directory Permissions**
- **Insecure Temporary File Creation**

**Rationale for Removal**:
- 20+ vulnerabilities with "not available" patch status
- Package used only for optional model tracking/logging
- Core model deployment functionality works without it
- Risk outweighs benefit for this use case

**Alternative Solutions**:
- Manual logging to database
- Custom metrics tracking
- File-based experiment logging
- Other model registry solutions (e.g., ModelDB, DVC)

## Impact Assessment

### Features Affected

**No functionality loss**:
- ✅ Folder operations - Fully functional
- ✅ API key encryption - Fully functional (upgraded crypto)
- ✅ Model deployment - Fully functional
- ✅ Model inference - Fully functional
- ✅ A/B testing - Fully functional

**Optional feature removed**:
- ❌ MLflow integration - Model tracking/logging
  - Impact: Users must implement custom logging if needed
  - Workaround: Use custom database logging or file-based tracking

### Code Changes Required

**None** - The model_deployment.py code does not use mlflow directly. The import was included for future expansion but is not currently utilized.

## Verification

### Security Scan Results

**Before**:
- 34 vulnerabilities across 5 packages
- 4 critical (RCE)
- Multiple high severity

**After**:
- 0 vulnerabilities detected ✅
- All critical issues resolved ✅
- All high severity issues resolved ✅

### Testing Status

- ✅ Backend starts successfully
- ✅ All endpoints functional
- ✅ Encryption works correctly
- ✅ Model deployment operational
- ✅ No import errors

## Recommendations

### For Users

1. **Update Immediately**: Run `./setup.sh` or `pip install -r requirements.txt` to get patched versions
2. **Model Files**: Validate all model files from untrusted sources before loading
3. **Access Control**: Restrict who can upload models to the backend
4. **Monitoring**: Monitor model inference for unusual behavior

### For Developers

1. **Dependency Auditing**: Run security scans on every dependency update
2. **Version Pinning**: Keep dependencies pinned to specific versions
3. **Regular Updates**: Check for security updates monthly
4. **Alternative Packages**: Evaluate alternatives when packages have many vulnerabilities
5. **Minimal Dependencies**: Only include necessary packages

## Timeline

- **2026-02-17**: Vulnerabilities discovered via GitHub Advisory scan
- **2026-02-17**: All vulnerable dependencies updated/removed
- **2026-02-17**: Security verification completed
- **2026-02-17**: Documentation updated

## Future Monitoring

### Ongoing Actions
- Monitor GitHub Advisory Database for new vulnerabilities
- Update dependencies quarterly or when security patches released
- Evaluate mlflow alternatives if model tracking becomes critical
- Test all dependency updates in isolated environment first

### Alternative Model Tracking

If MLflow functionality is needed, consider:

1. **Custom Solution**: Implement lightweight logging to SQLite
   ```python
   # Simple model metrics tracking
   db.execute("""
       INSERT INTO model_metrics 
       (model_id, timestamp, metric_name, metric_value)
       VALUES (?, ?, ?, ?)
   """, (model_id, datetime.now(), "accuracy", accuracy))
   ```

2. **DVC (Data Version Control)**: Git-based ML experiment tracking
   - No known critical vulnerabilities
   - Integrates with Git workflows

3. **Weights & Biases**: Cloud-based (if external services acceptable)
   - Maintained by active team
   - Regular security updates

4. **TensorBoard**: For TensorFlow/PyTorch
   - Built into frameworks
   - Smaller attack surface

## Contact

For security concerns or questions:
- Open an issue on GitHub
- Tag with "security" label
- Reference this advisory document

## References

- GitHub Advisory Database: https://github.com/advisories
- CVE Database: https://cve.mitre.org/
- PyPI Security: https://pypi.org/security/

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-17  
**Status**: Active
